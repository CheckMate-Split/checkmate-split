import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Text from '../components/Text';
import PageHeader from '../components/PageHeader';
import { colors, spacing } from '../constants';

export type ReceiptParams = {
  Receipt: { id: string; receipt: any };
};

export default function ReceiptScreen() {
  const route = useRoute<RouteProp<ReceiptParams, 'Receipt'>>();
  const navigation = useNavigation<any>();
  const { receipt } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Receipt" onBack={navigation.goBack} />
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

