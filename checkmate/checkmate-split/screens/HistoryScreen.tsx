import React from 'react';
import { StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { httpsCallable } from 'firebase/functions';
import { useStripe } from '@stripe/stripe-react-native';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import { colors, spacing } from '../constants';
import { functions } from '../firebaseConfig';

export default function HistoryScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const handleCheckout = async (cashAppOnly?: boolean) => {
    try {
      const createIntent = httpsCallable(functions, 'createPaymentIntent');
      const res: any = await createIntent({ cashAppOnly });
      const clientSecret = res?.data?.clientSecret;
      if (!clientSecret) return;
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'CheckMate',
        paymentIntentClientSecret: clientSecret,
        returnURL: Linking.createURL('/payment-complete'),
        applePay: { merchantCountryCode: 'US' },
        allowsDelayedPaymentMethods: true,
      });
      if (error) {
        console.error(error);
        return;
      }
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) console.error(presentError);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="History" />
      <Text style={styles.empty}>no past receipts</Text>
      <Button title="Sample Checkout" onPress={() => handleCheckout(false)} style={styles.button} />
      <OutlineButton title="Pay with Cash App" onPress={() => handleCheckout(true)} style={styles.button} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
  empty: {
    marginTop: spacing.m,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.l,
  },
});
