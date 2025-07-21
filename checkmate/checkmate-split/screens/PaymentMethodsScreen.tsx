import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { httpsCallable } from 'firebase/functions';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import Text from '../components/Text';
import { colors, spacing } from '../constants';
import { functions } from '../firebaseConfig';
import { useConnectLink } from '../connectLink';

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<any>();
  const { walletId } = useConnectLink();
  const [balance, setBalance] = useState<number>(0);

  useEffect(() => {
    if (walletId) fetchBalance();
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.balance}>${balance.toFixed(2)}</Text>
      <PageHeader title="Payments & Balance" onBack={navigation.goBack} />
      {walletId ? (
        <View style={styles.footer}>
          <OutlineButton title="Refresh Balance" onPress={fetchBalance} style={styles.button} />
          <OutlineButton title="Fund" onPress={() => {}} style={styles.button} />
          <OutlineButton title="Withdraw" onPress={() => {}} style={styles.button} />
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
