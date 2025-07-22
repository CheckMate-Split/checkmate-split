import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import { colors, spacing } from '../constants';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [friendReq, setFriendReq] = useState(true);
  const [paymentRecv, setPaymentRecv] = useState(true);
  const [claim, setClaim] = useState(false);
  const [requestPay, setRequestPay] = useState(true);
  const [friendAccept, setFriendAccept] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!auth.currentUser) return;
      const snap = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const s = snap.data()?.notificationSettings || {};
      setFriendReq(s.friendReq !== false);
      setPaymentRecv(s.paymentRecv !== false);
      setClaim(!!s.claim);
      setRequestPay(s.requestPay !== false);
      setFriendAccept(s.friendAccept !== false);
    };
    load();
  }, []);

  const updateSetting = async (key: string, value: boolean) => {
    if (!auth.currentUser) return;
    const newSettings = {
      friendReq,
      paymentRecv,
      claim,
      requestPay,
      friendAccept,
      [key]: value,
    } as any;
    await setDoc(
      doc(db, 'users', auth.currentUser.uid),
      { notificationSettings: newSettings },
      { merge: true }
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Notifications" onBack={navigation.goBack} />
      <View style={styles.row}>
        <Text>Friend Requests</Text>
        <Switch
          value={friendReq}
          onValueChange={v => {
            setFriendReq(v);
            updateSetting('friendReq', v);
          }}
        />
      </View>
      <View style={styles.row}>
        <Text>Payment Received</Text>
        <Switch
          value={paymentRecv}
          onValueChange={v => {
            setPaymentRecv(v);
            updateSetting('paymentRecv', v);
          }}
        />
      </View>
      <View style={styles.row}>
        <Text>Claim Notifications</Text>
        <Switch
          value={claim}
          onValueChange={v => {
            setClaim(v);
            updateSetting('claim', v);
          }}
        />
      </View>
      <View style={styles.row}>
        <Text>Requested to Pay</Text>
        <Switch
          value={requestPay}
          onValueChange={v => {
            setRequestPay(v);
            updateSetting('requestPay', v);
          }}
        />
      </View>
      <View style={styles.row}>
        <Text>Friend Acceptances</Text>
        <Switch
          value={friendAccept}
          onValueChange={v => {
            setFriendAccept(v);
            updateSetting('friendAccept', v);
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.m,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});
