import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { httpsCallable } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useStripe } from '@stripe/stripe-react-native';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import MenuItem from '../components/MenuItem';
import Text from '../components/Text';
import { colors, spacing } from '../constants';
import { functions } from '../firebaseConfig';

export default function PaymentMethodsScreen() {
  const navigation = useNavigation<any>();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [balance, setBalance] = useState<number>(0);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [methods, setMethods] = useState<Array<{ id: string; brand: string; last4: string }>>([]);
  const [achConnected, setAchConnected] = useState<boolean | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('stripeCustomerId');
      if (stored) {
        setCustomerId(stored);
        await fetchMethods(stored);
      }
    } catch (e) {
      console.error(e);
    }
    fetchBalance();
    fetchAchStatus();
  };

  const fetchAchStatus = async () => {
    try {
      const fn = httpsCallable(functions, 'getConnectStatus');
      const res: any = await fn();
      if (res?.data?.connected != null) {
        setAchConnected(res.data.connected);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchBalance = async () => {
    try {
      const getBal = httpsCallable(functions, 'getBalance');
      const res: any = await getBal();
      if (res?.data?.balance != null) {
        setBalance(res.data.balance / 100);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMethods = async (cust: string) => {
    try {
      const list = httpsCallable(functions, 'listPaymentMethods');
      const res: any = await list({ customerId: cust });
      if (Array.isArray(res?.data)) {
        setMethods(res.data as any);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddMethod = async () => {
    try {
      const createIntent = httpsCallable(functions, 'createSetupIntent');
      const res: any = await createIntent();
      const clientSecret = res?.data?.clientSecret;
      const key = res?.data?.ephemeralKey;
      const cust = res?.data?.customerId;
      if (!clientSecret || !key || !cust) return;
      await AsyncStorage.setItem('stripeCustomerId', cust);
      setCustomerId(cust);
      const { error } = await initPaymentSheet({
        customerId: cust,
        customerEphemeralKeySecret: key,
        setupIntentClientSecret: clientSecret,
        merchantDisplayName: 'CheckMate',
      });
      if (error) {
        console.error(error);
        return;
      }
      const { error: presentError } = await presentPaymentSheet();
      if (!presentError) {
        fetchMethods(cust);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleConnectAch = async () => {
    try {
      const createLink = httpsCallable(functions, 'createStripeConnectLink');
      const res: any = await createLink({});
      if (res?.data?.url) {
        Linking.openURL(res.data.url);
        fetchAchStatus();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderMethod = ({ item }: { item: typeof methods[0] }) => (
    <MenuItem
      title={`${item.brand} **** ${item.last4}`}
      icon="card"
      onPress={() => {}}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.balance}>${balance.toFixed(2)}</Text>
      <PageHeader title="Payments & Balance" onBack={navigation.goBack} />
      <FlatList
        data={methods}
        keyExtractor={(item) => item.id}
        renderItem={renderMethod}
        ListFooterComponent={
          <View style={styles.footer}>
            <Button title="Add Payment Method" onPress={handleAddMethod} />
            {achConnected === null ? null : achConnected ? (
              <>
                <OutlineButton title="Fund" onPress={() => {}} style={styles.button} />
                <OutlineButton title="Withdraw" onPress={() => {}} style={styles.button} />
              </>
            ) : (
              <OutlineButton
                title="Connect ACH"
                onPress={handleConnectAch}
                style={styles.button}
              />
            )}
          </View>
        }
      />
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
