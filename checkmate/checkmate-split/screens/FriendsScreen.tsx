import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

export default function FriendsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Friends" />
      <Text style={styles.empty}>no friends yet</Text>
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
});
