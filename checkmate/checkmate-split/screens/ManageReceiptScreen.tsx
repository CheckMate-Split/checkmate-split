import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Modal,
  Share,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import Text from '../components/Text';
import PageHeader from '../components/PageHeader';
import OutlineButton from '../components/OutlineButton';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing } from '../constants';
import Button from '../components/Button';
import { auth } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';


export type ManageReceiptParams = {
  ManageReceipt: { receipt: any };
};

export default function ManageReceiptScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ManageReceiptParams, 'ManageReceipt'>>();
  const { receipt } = route.params;

  const [qrVisible, setQrVisible] = useState(false);
  const [payVisible, setPayVisible] = useState(false);

  const created = receipt.createdAt
    ? new Date(receipt.createdAt.seconds
        ? receipt.createdAt.seconds * 1000
        : receipt.createdAt)
    : new Date();

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
  const people = Object.keys(totals).map(id => ({
    id,
    name: id === auth.currentUser?.uid ? 'You' : 'Person',
    amount: totals[id],
    status: id === receipt.payer ? 'Paid' : 'Not Paid',
  }));

  const you = people.find(p => p.id === auth.currentUser?.uid);
  const others = people.filter(p => p.id !== auth.currentUser?.uid);
  const isOwner = receipt.payer === auth.currentUser?.uid;
  const othersTotal = others.reduce((sum, p) => sum + p.amount, 0);
  const yourTotal = you ? you.amount : 0;

  const handleEdit = () => {
    navigation.navigate('HomeTab', {
      screen: 'CreateReceipt',
      params: { data: receipt.data, manual: true, edit: true, receiptId: receipt.id },
    });
  };


  const renderPerson = (p: any) => (
    <View key={p.id}>
      <View style={styles.personContainer}>
        <View style={styles.personRow}>
          <View style={styles.avatar} />
          <Text style={styles.personName}>{p.name}</Text>
          <Text style={styles.amount}>{`$${p.amount.toFixed(2)}`}</Text>
          <View
            style={[
              styles.tag,
              p.status === 'Paid'
                ? styles.tagPaid
                : p.status === 'Viewed'
                ? styles.tagViewed
                : styles.tagUnpaid,
            ]}
          >
            <Text style={styles.tagText}>
              {p.status === 'Paid' ? 'Paid' : p.status === 'Viewed' ? 'Viewed' : 'Not Paid'}
            </Text>
          </View>
        </View>
      </View>
      {p.id === auth.currentUser?.uid && (
        <Button
          title="Claim More"
          onPress={() =>
            navigation.navigate('Tabs', {
              screen: 'HomeTab',
              params: { screen: 'ClaimItems', params: { receipt } },
            })
          }
          style={styles.claimButton}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title={receipt.name || 'Receipt'}
        onBack={navigation.goBack}
        right={
          isOwner && (
            <TouchableOpacity onPress={handleEdit} style={styles.iconButton}>
              <Ionicons name="pencil" size={24} color={colors.text} />
            </TouchableOpacity>
          )
        }
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.subheader}>{`shared on ${created.toLocaleDateString()}`}</Text>
        {receipt.description ? <Text style={styles.desc}>{receipt.description}</Text> : null}
        {you && (
          <>
            <Text style={styles.section}>You</Text>
            {renderPerson(you)}
            <Text style={styles.section}>Others</Text>
          </>
        )}
        {others.length === 0 ? (
          <Text style={styles.noOthers}>
            no others added yet, press the buttons below to share
          </Text>
        ) : (
          others.map(renderPerson)
        )}
      </ScrollView>
      {!isOwner && (
        <Button title="Pay" onPress={() => setPayVisible(true)} style={styles.payButton} />
      )}
      <View style={styles.footer}>
        <OutlineButton
          title="Share QR"
          onPress={() => setQrVisible(true)}
          style={styles.shareButton}
          icon="qr-code"
        />
        <OutlineButton
          title="Share Link"
          onPress={() => Share.share({ message: receipt.id })}
          style={styles.shareButton}
          icon="link-outline"
        />
      </View>
      <Modal
        visible={payVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPayVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setPayVisible(false)}>
          <View style={styles.modalContent}>
            <Button title="Card" onPress={() => setPayVisible(false)} style={styles.payOption} />
            <Button title="Cash App" onPress={() => setPayVisible(false)} style={styles.payOption} />
            <Button title="Apple Pay" onPress={() => setPayVisible(false)} style={styles.payOption} />
            <Button title="Balance / ACH" onPress={() => setPayVisible(false)} style={styles.payOption} />
            <OutlineButton title="Close" onPress={() => setPayVisible(false)} style={styles.closeButton} />
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal
        visible={qrVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setQrVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setQrVisible(false)}>
          <View style={styles.modalContent}>
            <QRCode value={receipt.id} size={200} />
            <OutlineButton title="Close" onPress={() => setQrVisible(false)} style={styles.closeButton} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { paddingHorizontal: spacing.m, paddingBottom: spacing.m },
  subheader: { color: '#666', fontSize: 28 },
  desc: { marginTop: spacing.s, fontSize: 28 },
  personContainer: {
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ccc',
    marginRight: spacing.m,
  },
  personName: { flex: 1, fontSize: 28 },
  section: { marginTop: spacing.l, fontSize: 32, fontWeight: '600' },
  link: { color: colors.primary, marginTop: spacing.s },
  tag: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s / 2,
    borderRadius: 12,
  },
  tagText: { color: '#fff', fontSize: 21 },
  amount: { marginRight: spacing.m, fontSize: 28, fontWeight: '600' },
  tagUnpaid: { backgroundColor: '#999' },
  tagViewed: { backgroundColor: '#f88' },
  tagPaid: { backgroundColor: '#4c9a4c' },
  payButton: { marginHorizontal: spacing.m, marginTop: spacing.l },
  claimButton: {
    alignSelf: 'center',
    marginTop: spacing.m,
    marginBottom: spacing.s,
    width: '70%',
    paddingVertical: 0,
  },
  iconButton: { marginLeft: spacing.m },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.m,
  },
  noOthers: {
    textAlign: 'center',
    color: '#666',
    marginTop: spacing.m,
  },
  shareButton: { flex: 1, marginHorizontal: spacing.s / 2 },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    padding: spacing.l,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  payOption: { alignSelf: 'stretch', marginTop: spacing.s },
  closeButton: {
    marginTop: spacing.l,
    alignSelf: 'stretch',
  },
});
