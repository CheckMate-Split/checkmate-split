import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import PageHeader from '../components/PageHeader';
import ReceiptCard from '../components/ReceiptCard';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

export default function CurrentReceiptsScreen() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const q = query(collection(db, 'receipts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <ReceiptCard
      receipt={item}
      onPress={() => navigation.navigate('Receipt', { id: item.id, receipt: item })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Current" onBack={navigation.goBack} />
      <FlatList
        data={receipts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={receipts.length === 0 && styles.emptyContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>no receipts yet</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.m,
  },
});
