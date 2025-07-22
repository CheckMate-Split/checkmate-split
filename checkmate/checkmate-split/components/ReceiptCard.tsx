import React, { useEffect, useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { colors, spacing } from '../constants';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

interface Props {
  receipt: any;
  onPress: () => void;
}

export default function ReceiptCard({ receipt, onPress }: Props) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [payerName, setPayerName] = useState<string>('');
  const isPayer = receipt.payer === auth.currentUser?.uid;
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', receipt.payer));
        if (active && snap.exists()) {
          const data = snap.data();
          setPhoto(data.photo || null);
          const first = data.first || '';
          const last = data.last || '';
          setPayerName(`${first} ${last}`.trim());
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (receipt.payer) load();
    return () => {
      active = false;
    };
  }, [receipt.payer]);
  const items: any[] = receipt.data?.lineItems || [];
  const totals: Record<string, number> = {};
  items.forEach((item: any) => {
    const resp = item.responsible || receipt.payer;
    const amt = item.amount?.data || 0;
    totals[resp] = (totals[resp] || 0) + amt;
  });
  if (!totals[receipt.payer]) {
    totals[receipt.payer] = 0;
  }
  const youTotal = auth.currentUser ? totals[auth.currentUser.uid] || 0 : 0;
  const othersTotal = Object.keys(totals)
    .filter(id => id !== auth.currentUser?.uid)
    .reduce((sum, id) => sum + totals[id], 0);
  const owed = isPayer ? othersTotal : youTotal;
  const created = receipt.createdAt
    ? new Date(
        receipt.createdAt.seconds
          ? receipt.createdAt.seconds * 1000
          : receipt.createdAt
      )
    : null;
  const dateStr = created
    ? created.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '';
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconWrapper}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.avatar} />
        ) : (
          <Ionicons name="receipt" size={24} color={colors.primary} />
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.title}>
            {(receipt.name || receipt.data?.merchantName || 'Receipt') +
              (dateStr ? ` - ${dateStr}` : '')}
          </Text>
          <Text style={styles.amount}>{`$${owed.toFixed(2)}`}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>
            {(payerName || 'Someone') + ' - ' + (isPayer ? 'Others Owe' : 'You Owe')}
          </Text>
          <Text style={styles.action}>{isPayer ? 'Collect' : 'Settle Up'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    padding: spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: spacing.s,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  info: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  amount: {
    fontSize: 18,
    fontWeight: '600',
  },
  label: {
    color: '#666',
    marginTop: spacing.s / 2,
  },
  action: {
    marginTop: spacing.s / 2,
    fontWeight: '500',
  },
});

