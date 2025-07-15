import React from 'react';
import { View, StyleSheet } from 'react-native';
import PageHeader from '../components/PageHeader';
import { colors, spacing } from '../constants';

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <PageHeader title="Account" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
});
