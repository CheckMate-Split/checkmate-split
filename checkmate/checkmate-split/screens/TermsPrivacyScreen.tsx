import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import { colors, spacing } from '../constants';

export default function TermsPrivacyScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Terms & Privacy" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
});
