import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { httpsCallable } from 'firebase/functions';
import { doc, getDoc } from 'firebase/firestore';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import Text from '../components/Text';
import { colors, spacing } from '../constants';
import { functions, firestore, auth } from '../firebaseConfig';
import { useConnectLink } from '../connectLink';

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<any>();
  const { walletId } = useConnectLink();
  const [balance, setBalance] = useState<number>(0);
  const [venmoHandle, setVenmoHandle] = useState<string | null>(null);
  const [cashAppHandle, setCashAppHandle] = useState<string | null>(null);

  useEffect(() => {
    if (walletId) fetchBalance();
    fetchHandles();
  }, [walletId]);

  const fetchBalance = async () => {
    try {
      const callable = httpsCallable(functions, 'getMoovBalance');
      const res: any = await callable();
      if (res?.data?.balance != null) {
        setBalance(res.data.balance / 100);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchHandles = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setVenmoHandle(data.venmoHandle || null);
          setCashAppHandle(data.cashAppHandle || null);
        }
      }
    } catch (e) {
      console.error('Error fetching payment handles:', e);
    }
  };

  const openLink = (url: string) => {
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open the payment app.');
      }
    });
  };

  const handleVenmoPay = () => {
    const amount = balance.toFixed(2);
    const url = `venmo://paycharge?txn=pay&recipients=${venmoHandle}&amount=${amount}&note=CheckMate Payment`;
    openLink(url);
  };

  const handleCashAppPay = () => {
    const amount = balance.toFixed(2);
    const url = `cashapp://cash.me/${cashAppHandle}?amount=${amount}`;
    openLink(url);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.balance}>${balance.toFixed(2)}</Text>
      <PageHeader title="Payments & Balance" onBack={navigation.goBack} />
      
      {walletId ? (
        <View style={styles.footer}>
          <OutlineButton title="Refresh Balance" onPress={fetchBalance} style={styles.button} />
          <OutlineButton title="Fund" onPress={() => {}} style={styles.button} />
          <OutlineButton title="Withdraw" onPress={() => {}} style={styles.button} />
          {venmoHandle && (
            <Button title={`Pay via Venmo (@${venmoHandle})`} onPress={handleVenmoPay} style={styles.button} />
          )}
          {cashAppHandle && (
            <Button title={`Pay via Cash App ($${cashAppHandle})`} onPress={handleCashAppPay} style={styles.button} />
          )}
        </View>
      ) : (
        <Button title="Create Wallet" onPress={() => navigation.navigate('KYCForm')} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
  balance: {
    fontSize: 60,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: spacing.l,
  },
  footer: {
    marginTop: spacing.l,
  },
  button: {
    marginTop: spacing.m,
  },
});
