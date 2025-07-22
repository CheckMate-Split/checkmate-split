import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import SelectablePersonCard from '../components/SelectablePersonCard';
import Button from '../components/Button';
import { db, auth, functions } from '../firebaseConfig';
import { colors, spacing } from '../constants';

type Params = { AddGroupMembers: { id: string } };

export default function AddGroupMembersScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Params, 'AddGroupMembers'>>();
  const { id } = route.params;
  const [friends, setFriends] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    return onSnapshot(
      collection(db, 'users', auth.currentUser!.uid, 'friends'),
      async snap => {
        const arr = await Promise.all(
          snap.docs.map(async d => {
            const prof = await getDoc(doc(db, 'users', d.id));
            return { id: d.id, ...(prof.exists() ? prof.data() : {}) } as any;
          })
        );
        setFriends(arr);
      }
    );
  }, []);

  const addMembers = async () => {
    try {
      const fn = httpsCallable(functions, 'addGroupMembers');
      const list = Object.keys(selected).filter(k => selected[k]);
      await fn({ groupId: id, members: list });
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <SelectablePersonCard
      user={item}
      value={!!selected[item.id]}
      onValueChange={v => setSelected({ ...selected, [item.id]: v })}
    />
  );

  const selectedCount = Object.values(selected).filter(Boolean).length;

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Add Friends" onBack={navigation.goBack} />
      <FlatList
        data={friends}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>no friends</Text>}
      />
      <Button
        title="Add to Group"
        onPress={addMembers}
        style={styles.button}
        disabled={!selectedCount}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  empty: { textAlign: 'center', marginTop: spacing.l },
  button: { marginTop: spacing.l },
});
