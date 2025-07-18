import React, { useState } from 'react';
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
  const { initPaymentSheet, presentPaymentSheet, confirmPayment } = useStripe();
  const [loadingType, setLoadingType] = useState<null | 'card' | 'cashApp'>(null);

  const handleCheckout = async (cashAppOnly?: boolean) => {
    setLoadingType(cashAppOnly ? 'cashApp' : 'card');
    try {
      const createIntent = httpsCallable(functions, 'createPaymentIntent');
      const res: any = await createIntent({ cashAppOnly });
      const clientSecret = res?.data?.clientSecret;
      if (!clientSecret) return;
      if (cashAppOnly) {
        const { error } = await confirmPayment(clientSecret, {
          paymentMethodType: 'CashApp',
          returnURL: Linking.createURL('/payment-complete'),
        } as any);
        if (error) console.error(error);
      } else {
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
      }
    } catch (e) {
      console.error(e);
    }
    setLoadingType(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="History" />
      <Text style={styles.empty}>no past receipts</Text>
      <Button
        title="Sample Checkout"
        onPress={() => handleCheckout(false)}
        style={styles.button}
        loading={loadingType === 'card'}
        disabled={loadingType !== null}
      />
      <OutlineButton
        title="Pay with Cash App"
        onPress={() => handleCheckout(true)}
        style={styles.button}
        loading={loadingType === 'cashApp'}
        disabled={loadingType !== null}
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
  empty: {
    marginTop: spacing.m,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.l,
  },
});
