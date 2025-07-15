import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text>History</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
  },
});

