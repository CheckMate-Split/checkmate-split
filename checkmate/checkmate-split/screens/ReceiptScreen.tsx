import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

export type ReceiptParams = {
  Receipt: { id: string; receipt: any };
};

export default function ReceiptScreen() {
  const route = useRoute<RouteProp<ReceiptParams, 'Receipt'>>();
  const { receipt } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text>{JSON.stringify(receipt, null, 2)}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
});

