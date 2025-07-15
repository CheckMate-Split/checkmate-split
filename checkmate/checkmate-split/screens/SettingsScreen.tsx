import React, { useEffect } from 'react';
import { StyleSheet, View, Linking } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import Text from '../components/Text';
import Button from '../components/Button';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebaseConfig';
import { colors, spacing } from '../constants';

export default function SettingsScreen() {
  useEffect(() => {
    const sub = Linking.addEventListener('url', event => {
      if (event.url.includes('stripe-return')) {
        // In a real app you might refresh user data here
        console.log('Stripe onboarding complete');
      }
    });
    return () => sub.remove();
  }, []);

  const handleConnect = async () => {
    try {
      const callable = httpsCallable(functions, 'createStripeConnectLink');
      const res: any = await callable({
        returnUrl: ExpoLinking.createURL('stripe-return'),
        refreshUrl: ExpoLinking.createURL('stripe-refresh'),
      });
      const url = res.data.url;
      if (url) Linking.openURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Button title="Stripe Connect Signup" onPress={handleConnect} style={styles.button} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginBottom: spacing.m },
  button: { width: '90%' },
});
