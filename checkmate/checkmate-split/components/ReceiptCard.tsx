import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { colors, spacing } from '../constants';
import { auth } from '../firebaseConfig';

interface Props {
  receipt: any;
  onPress: () => void;
}

export default function ReceiptCard({ receipt, onPress }: Props) {
  const total = receipt.data?.totalAmount?.data ?? receipt.data?.total?.data;
  const isPayer = receipt.payer === auth.currentUser?.uid;
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconWrapper}>
        <Ionicons name="receipt" size={24} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.title}>
            {receipt.name || receipt.data?.merchantName || 'Receipt'}
          </Text>
          {total !== undefined && (
            <Text style={styles.amount}>{`$${Number(total).toFixed(2)}`}</Text>
          )}
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>{isPayer ? 'Total Owed' : 'Total Due'}</Text>
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
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
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

