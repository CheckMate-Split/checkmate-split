import React from 'react';
import { View, StyleSheet } from 'react-native';
import PageHeader from '../components/PageHeader';
import { colors, spacing } from '../constants';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <PageHeader title="Notifications" />
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
