import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import PageHeader from '../components/PageHeader';
import ReceiptCard from '../components/ReceiptCard';
import OutlineButton from '../components/OutlineButton';
import { db, auth, functions } from '../firebaseConfig';
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
    return onSnapshot(q, snap => {
      const arr: any[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      const filtered = arr.filter(r => {
        const items: any[] = r.data?.lineItems || [];
        const participants = new Set(
          items.map(i => i.responsible || r.payer)
        );
        participants.add(r.payer);
        return participants.has(uid) && participants.has(auth.currentUser!.uid);
      });
      setReceipts(filtered);
    });
  }, [uid]);

  const renderItem = ({ item }: { item: any }) => (
    <ReceiptCard receipt={item} onPress={() => navigation.navigate('ManageReceipt', { receipt: item })} />
  );

  const remove = async () => {
    try {
      const fn = httpsCallable(functions, 'removeFriend');
      await fn({ uid });
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const confirmRemove = () => {
    Alert.alert('Remove Friend', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: remove },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title={name} onBack={navigation.goBack} />
      <FlatList
        data={receipts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={receipts.length === 0 && styles.empty}
      />
      <OutlineButton
        title="Remove Friend"
        onPress={confirmRemove}
        style={styles.removeButton}
        textColor={colors.pinkRed}
        borderColor={colors.pinkRed}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  empty: { flexGrow: 1, justifyContent: 'center' },
  removeButton: { marginTop: spacing.l },
});
