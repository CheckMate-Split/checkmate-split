import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  View,
  TouchableOpacity,
} from 'react-native';
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
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const navigation = useNavigation<any>();

  useEffect(() => {
    const q = query(collection(db, 'receipts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
  }, []);

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const activeReceipts = receipts.filter(r => {
    const created = r.createdAt
      ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt)
      : new Date();
    return created >= cutoff;
  });
  const pastReceipts = receipts.filter(r => {
    const created = r.createdAt
      ? new Date(r.createdAt.seconds ? r.createdAt.seconds * 1000 : r.createdAt)
      : new Date();
    return created < cutoff;
  });

  const renderItem = ({ item }: { item: any }) => (
    <ReceiptCard
      receipt={item}
      onPress={() => navigation.navigate('ManageReceipt', { receipt: item })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Receipts" noTopMargin />
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab('active')}
          style={[styles.tab, tab === 'active' && styles.tabSelected]}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextSelected]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('past')}
          style={[styles.tab, tab === 'past' && styles.tabSelected]}
        >
          <Text style={[styles.tabText, tab === 'past' && styles.tabTextSelected]}>Past</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={tab === 'active' ? activeReceipts : pastReceipts}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={
            (tab === 'active' ? activeReceipts.length === 0 : pastReceipts.length === 0) &&
            styles.emptyContainer
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>no receipts yet</Text>
          }
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
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  tab: {
    flex: 1,
    paddingTop: spacing.s,
    paddingBottom: spacing.m,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabSelected: {
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 18,
    color: '#666',
  },
  tabTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
