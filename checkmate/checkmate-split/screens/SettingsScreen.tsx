import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <Text>Settings</Text>
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
