import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Modal,
  Share,
  TouchableOpacity,
  Image,
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
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';


export type ManageReceiptParams = {
  ManageReceipt: { receipt: any };
};

export default function ManageReceiptScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ManageReceiptParams, 'ManageReceipt'>>();
  const { receipt } = route.params;

  const [qrVisible, setQrVisible] = useState(false);
  const [payVisible, setPayVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);

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

  let you = people.find(p => p.id === auth.currentUser?.uid);
  if (!you && auth.currentUser) {
    you = { id: auth.currentUser.uid, name: 'You', amount: 0, status: 'Not Paid' };
  }
  const others = people.filter(p => p.id !== auth.currentUser?.uid);
  const isOwner = receipt.payer === auth.currentUser?.uid;
  const othersTotal = others.reduce((sum, p) => sum + p.amount, 0);
  const yourTotal = you ? you.amount : 0;

  const handleEdit = () => {
    navigation.navigate('Tabs', {
      screen: 'HomeTab',
      params: {
        screen: 'CreateReceipt',
        params: { edit: true, receipt },
      },
    });
  };

  const pay = async () => {
    try {
      const fn = httpsCallable(functions, 'createMoovPayment');
      await fn({ amount: Math.round(yourTotal), destWallet: receipt.payer });
    } catch (e) {
      console.error(e);
    }
    setPayVisible(false);
  };

  const payCard = pay;
  const payCash = pay;
  const payApple = pay;
  const payAch = pay;


  const renderPerson = (p: any) => {
    const isYou = p.id === auth.currentUser?.uid;
    const Container: any = isYou ? TouchableOpacity : View;
    const props = isYou
      ? {
          onPress: () =>
            navigation.navigate('ClaimItems', { receipt, fromManage: true }),
        }
      : {};
    return (
      <Container key={p.id} style={styles.personContainer} {...props}>
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
      </Container>
    );
  };

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
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subheader}>{`Receipt Date ${created.toLocaleDateString()}`}</Text>
        {receipt.description ? (
          <>
            <Text style={styles.descHeader}>Description</Text>
            <Text style={styles.desc}>{receipt.description}</Text>
          </>
        ) : null}
        {you && (
          <>
            <Text style={styles.section}>You</Text>
            {renderPerson(you)}
            <Text style={styles.section}>Others</Text>
          </>
        )}
        {others.length === 0 ? (
          <Text style={styles.noOthers}>
            No others added yet, press the buttons below to share
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
        <OutlineButton
          title="View Image"
          onPress={() => setImageVisible(true)}
          style={styles.shareButton}
          icon="image"
          disabled={!receipt.imageUrl}
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
            <Button title="Card" onPress={payCard} style={[styles.payOption, styles.payCard]} />
            <Button title="Cash App" onPress={payCash} style={[styles.payOption, styles.payCash]} />
            <Button title="Apple Pay" onPress={payApple} style={[styles.payOption, styles.payApple]} />
            <OutlineButton
              title="Balance / ACH"
              onPress={payAch}
              style={[styles.payOption, styles.payBalance]}
              textColor={colors.primary}
              borderColor={colors.primary}
            />
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
      <Modal
        visible={imageVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setImageVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setImageVisible(false)}>
          <View style={styles.modalContent}>
            {receipt.imageUrl && (
              <Image source={{ uri: receipt.imageUrl }} style={styles.receiptImage} resizeMode="contain" />
            )}
            <OutlineButton title="Close" onPress={() => setImageVisible(false)} style={styles.closeButton} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: spacing.m, paddingBottom: spacing.m },
  subheader: { color: '#666', fontSize: 28 },
  desc: { marginTop: spacing.s, fontSize: 28 },
  descHeader: {
    marginTop: spacing.m,
    fontSize: 30,
    fontWeight: '600',
  },
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
  iconButton: { marginRight: spacing.l },
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
  payCard: { backgroundColor: colors.primary },
  payCash: { backgroundColor: '#00C244' },
  payApple: { backgroundColor: '#000' },
  payBalance: { borderWidth: 1, borderColor: colors.primary, backgroundColor: colors.primaryBackground },
  closeButton: {
    marginTop: spacing.l,
    alignSelf: 'stretch',
  },
  receiptImage: {
    width: '100%',
    height: 400,
  },
});
