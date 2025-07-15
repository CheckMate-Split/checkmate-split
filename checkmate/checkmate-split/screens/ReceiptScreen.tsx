import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text>{JSON.stringify(receipt, null, 2)}</Text>
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
    padding: spacing.m,
  },
});

