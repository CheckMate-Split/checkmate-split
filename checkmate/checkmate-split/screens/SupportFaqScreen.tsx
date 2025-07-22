import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

export default function SupportFaqScreen() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Support & FAQ" onBack={navigation.goBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.content}>
          <Text style={styles.section}>Frequently Asked Questions</Text>
          <Text style={styles.question}>1. How does CheckMate work?</Text>
          <Text style={styles.answer}>
            Simply scan your receipt, claim your items, and pay your portion—including tax, tip, and a small service fee. No app download needed for your friends!
          </Text>
          <Text style={styles.question}>2. Do I need to create an account?</Text>
          <Text style={styles.answer}>
            Yes, creating an account allows you to track receipts, payment history, and saved payment methods. Guests claiming their portion don’t need an account.
          </Text>
          <Text style={styles.question}>3. What payment methods are supported?</Text>
          <Text style={styles.answer}>
            You can pay through Venmo, Cash App, Apple Pay, or credit/debit card. Bank transfers (ACH) are also available.
          </Text>
          <Text style={styles.question}>4. Can I use CheckMate at any restaurant?</Text>
          <Text style={styles.answer}>
            Yes! CheckMate works with any paper receipt, no POS integration needed.
          </Text>
          <Text style={styles.question}>5. How is tax and tip handled?</Text>
          <Text style={styles.answer}>
            Tax and tip are automatically calculated based on what you ordered—no more splitting evenly when you didn’t eat evenly.
          </Text>
          <Text style={styles.question}>6. Is there a fee to use CheckMate?</Text>
          <Text style={styles.answer}>
            The app is free to download. We charge a 3% service fee per transaction. Premium users pay no service fee and get additional features.
          </Text>
          <Text style={styles.question}>7. What is the Premium subscription?</Text>
          <Text style={styles.answer}>
            Premium users get no service fees, saved dining groups, expense history, and exclusive features for frequent users.
          </Text>
          <Text style={styles.question}>8. Can I send payment requests for group trips or events?</Text>
          <Text style={styles.answer}>
            Yes! Use CheckMate to split costs beyond restaurants: group gifts, rent, trips, or events.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.m,
  },
  section: {
    fontWeight: '600',
    fontSize: 18,
    marginTop: spacing.m,
  },
  question: {
    fontWeight: '600',
    marginTop: spacing.m,
  },
  answer: {
    marginTop: spacing.s,
    lineHeight: 20,
  },
});
