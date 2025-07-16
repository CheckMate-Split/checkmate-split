import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

export default function TermsPrivacyScreen() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Terms & Privacy" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.section}>1. Terms of Use</Text>
        <Text style={styles.paragraph}>
          By using CheckMate, you agree to our Terms of Use. CheckMate provides tools
          to split bills and facilitate payments but is not responsible for the
          accuracy of scanned receipts or payment outcomes. You are responsible for
          verifying charges before submitting payments.
        </Text>
        <Text style={styles.section}>2. Payment Processing</Text>
        <Text style={styles.paragraph}>
          CheckMate facilitates payments via third-party payment processors (e.g.,
          Venmo, Cash App, Apple Pay, etc.). We do not store sensitive banking or
          card information on our servers. Transaction fees and payment delays are
          subject to the policies of these third parties.
        </Text>
        <Text style={styles.section}>3. Liability Disclaimer</Text>
        <Text style={styles.paragraph}>
          CheckMate is not liable for payment disputes, misallocated payments, or
          incorrect bill splits. It is your responsibility to review and approve
          charges before submitting any payment.
        </Text>
        <Text style={styles.section}>4. Data Privacy</Text>
        <Text style={styles.paragraph}>
          We collect minimal personal information such as name, email, and payment
          preferences solely to operate the app. CheckMate does not sell your data to
          third parties. We use secure encryption to protect your information.
        </Text>
        <Text style={styles.section}>5. Community Guidelines</Text>
        <Text style={styles.paragraph}>
          Users are expected to use CheckMate respectfully. Fraudulent or abusive
          behavior will result in suspension or termination of your account.
        </Text>
        <Text style={styles.section}>6. Cancellation & Premium Subscriptions</Text>
        <Text style={styles.paragraph}>
          Premium accounts can be canceled at any time via the app settings. No
          refunds are provided for unused portions of the billing cycle.
        </Text>
        <Text style={styles.section}>7. Updates & Changes</Text>
        <Text style={styles.paragraph}>
          We may update these terms periodically. Continued use of the app signifies
          acceptance of any changes.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.m,
  },
  section: {
    fontWeight: '600',
    fontSize: 18,
    marginTop: spacing.m,
  },
  paragraph: {
    marginTop: spacing.s,
    lineHeight: 20,
  },
});
