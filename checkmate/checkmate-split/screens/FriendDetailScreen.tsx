import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import PageHeader from '../components/PageHeader';
import ReceiptCard from '../components/ReceiptCard';
import { db, auth } from '../firebaseConfig';
import { colors, spacing } from '../constants';

export type FriendDetailParams = {
  FriendDetail: { uid: string; name: string };
};

export default function FriendDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<FriendDetailParams, 'FriendDetail'>>();
  const { uid, name } = route.params;
  const [receipts, setReceipts] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'receipts'),
      where('payer', 'in', [auth.currentUser!.uid, uid]),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => setReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [uid]);

  const renderItem = ({ item }: { item: any }) => (
    <ReceiptCard receipt={item} onPress={() => navigation.navigate('ManageReceipt', { receipt: item })} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title={name} onBack={navigation.goBack} />
      <FlatList
        data={receipts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={receipts.length === 0 && styles.empty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  empty: { flexGrow: 1, justifyContent: 'center' },
});
