import React, { useState, useEffect } from 'react';
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
import * as Linking from 'expo-linking';
import { useStripe } from '@stripe/stripe-react-native';
import Text from '../components/Text';
import PageHeader from '../components/PageHeader';
import OutlineButton from '../components/OutlineButton';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing } from '../constants';
import Button from '../components/Button';
import { auth, db } from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import PersonActionDrawer from '../components/PersonActionDrawer';


export type ManageReceiptParams = {
  ManageReceipt: { receipt: any; fromCreate?: boolean };
};

export default function ManageReceiptScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ManageReceiptParams, 'ManageReceipt'>>();
  const { receipt, fromCreate } = route.params;

  const [qrVisible, setQrVisible] = useState(false);
  const [payVisible, setPayVisible] = useState(false);
  const [imageVisible, setImageVisible] = useState(false);
  const [personDrawer, setPersonDrawer] = useState<any | null>(null);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

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
  const participants: string[] = Array.isArray(receipt.participants)
    ? receipt.participants
    : [];
  participants.forEach(uid => {
    if (!totals[uid]) {
      totals[uid] = 0;
    }
  });
  const initialPayments: Record<string, number> = {
    [receipt.payer]: totals[receipt.payer] || 0,
    ...(receipt.payments || {}),
  };
  const [paidAmounts, setPaidAmounts] = useState<Record<string, number>>(initialPayments);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const ids = Object.keys(totals);
        const arr = await Promise.all(
          ids.map(async id => {
            const snap = await getDoc(doc(db, 'users', id));
            return { id, ...(snap.exists() ? snap.data() : {}) } as any;
          })
        );
        if (active) {
          const obj: Record<string, any> = {};
          arr.forEach(u => {
            obj[u.id] = u;
          });
          setProfiles(obj);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [receipt]);

  const people = Object.keys(totals).map(id => {
    const prof = profiles[id];
    const name =
      id === auth.currentUser?.uid
        ? 'You'
        : prof
        ? `${prof.first || ''} ${prof.last || ''}`.trim() || prof.username || 'Unknown'
        : '...';
    const isPaid = (paidAmounts[id] || 0) >= totals[id];
    return { id, name, amount: totals[id], status: isPaid ? 'Paid' : 'Not Paid' };
  });

  let you = people.find(p => p.id === auth.currentUser?.uid);
  if (!you && auth.currentUser) {
    you = { id: auth.currentUser.uid, name: 'You', amount: 0, status: 'Not Paid' };
  }
  const others = people.filter(p => p.id !== auth.currentUser?.uid);
  const isOwner = receipt.payer === auth.currentUser?.uid;
  const othersTotal = others.reduce((sum, p) => sum + p.amount, 0);
  const yourTotal = you ? you.amount : 0;
  const yourPaid = paidAmounts[auth.currentUser?.uid || ''] || 0;
  const yourDue = yourTotal - yourPaid;

  const handleEdit = () => {
    navigation.navigate('Tabs', {
      screen: 'HomeTab',
      params: {
        screen: 'CreateReceipt',
        params: { edit: true, receipt },
      },
    });
  };

  const { initPaymentSheet, presentPaymentSheet, confirmPayment } = useStripe();

  const createIntent = async (cashApp?: boolean) => {
    try {
      const fn = httpsCallable(functions, 'createPaymentIntent');
      const due = yourDue;
      const res: any = await fn({ amount: Math.round(due * 100), cashAppOnly: cashApp });
      return res?.data?.clientSecret as string | undefined;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  };

  const payCard = async () => {
    const clientSecret = await createIntent(false);
    if (!clientSecret) return;
    const { error } = await initPaymentSheet({
      merchantDisplayName: 'CheckMate',
      paymentIntentClientSecret: clientSecret,
      applePay: { merchantCountryCode: 'US' },
      allowsDelayedPaymentMethods: true,
    });
    if (!error) {
      const { error: presentError } = await presentPaymentSheet();
      if (!presentError) {
        const amt = (paidAmounts[auth.currentUser?.uid || ''] || 0) + yourDue;
        await updateDoc(doc(db, 'receipts', receipt.id), {
          [`payments.${auth.currentUser?.uid}`]: amt,
        });
        setPaidAmounts({ ...paidAmounts, [auth.currentUser?.uid || '']: amt });
      }
    }
    setPayVisible(false);
  };

  const payCash = async () => {
    const clientSecret = await createIntent(true);
    if (!clientSecret) return;
    const { error } = await confirmPayment(clientSecret, {
      paymentMethodType: 'CashApp',
      returnURL: Linking.createURL('/payment-complete'),
    } as any);
    if (!error) {
      const amt = (paidAmounts[auth.currentUser?.uid || ''] || 0) + yourDue;
      await updateDoc(doc(db, 'receipts', receipt.id), {
        [`payments.${auth.currentUser?.uid}`]: amt,
      });
      setPaidAmounts({ ...paidAmounts, [auth.currentUser?.uid || '']: amt });
    }
    setPayVisible(false);
  };

  const payApple = payCard;
  const payAch = payCard;

  const addFriends = () => {
    navigation.navigate('AddReceiptFriends', { id: receipt.id });
  };

  const togglePaid = async (uid: string) => {
    const isPaid = (paidAmounts[uid] || 0) >= totals[uid];
    const newVal = isPaid ? 0 : totals[uid];
    try {
      await updateDoc(doc(db, 'receipts', receipt.id), {
        [`payments.${uid}`]: newVal,
      });
      setPaidAmounts({ ...paidAmounts, [uid]: newVal });
    } catch (e) {
      console.error(e);
    }
  };


  const renderPerson = (p: any) => {
    const isYou = p.id === auth.currentUser?.uid;
    const Container: any = TouchableOpacity;
    const props = {
      onPress: () => {
        if (isOwner && !isYou) {
          setPersonDrawer(p);
        } else {
          navigation.navigate('ClaimItems', { receipt, fromManage: true });
        }
      },
    };
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
        onBack={fromCreate ? () => navigation.navigate('Tabs', { screen: 'Friends', params: { screen: 'FriendsHome' } }) : navigation.goBack}
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
        yourDue > 0 ? (
          <Button title="Pay" onPress={() => setPayVisible(true)} style={styles.payButton} />
        ) : (
          <Button title="Claim Items" onPress={() => navigation.navigate('ClaimItems', { receipt, fromManage: true })} style={styles.payButton} />
        )
      )}
      {isOwner && (
        <Button title="Add Friends" onPress={addFriends} style={styles.addButton} />
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
      <PersonActionDrawer
        visible={!!personDrawer}
        name={personDrawer?.name || ''}
        paid={personDrawer ? (paidAmounts[personDrawer.id] || 0) >= totals[personDrawer.id] : false}
        onTogglePaid={() => {
          if (personDrawer) togglePaid(personDrawer.id);
          setPersonDrawer(null);
        }}
        onEdit={() => {
          if (personDrawer)
            navigation.navigate('ClaimItems', { receipt, fromManage: true, uid: personDrawer.id });
          setPersonDrawer(null);
        }}
        onClose={() => setPersonDrawer(null)}
      />
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
  addButton: { marginHorizontal: spacing.m, marginBottom: spacing.s },
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
