import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import PageHeader from '../components/PageHeader';
import ReceiptCard from '../components/ReceiptCard';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

export default function ReceiptsScreen() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();

  useEffect(() => {
    const q = query(collection(db, 'receipts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <ReceiptCard
      receipt={item}
      onPress={() => navigation.navigate('ManageReceipt', { receipt: item })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Receipts" />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={receipts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={receipts.length === 0 && styles.emptyContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>no receipts yet</Text>}
        />
      )}
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
