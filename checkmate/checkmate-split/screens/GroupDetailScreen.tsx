import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import MemberDrawer from '../components/MemberDrawer';
import PersonCard from '../components/PersonCard';
import { db, auth } from '../firebaseConfig';
import { colors, spacing } from '../constants';

export type GroupDetailParams = {
  GroupDetail: { id: string };
};

export default function GroupDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<GroupDetailParams, 'GroupDetail'>>();
  const { id } = route.params;
  const [group, setGroup] = useState<any>(null);
  const [selected, setSelected] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    return onSnapshot(doc(db, 'groups', id), snap => setGroup(snap.data() || null));
  }, [id]);

  useEffect(() => {
    if (!group) return;
    let active = true;
    const load = async () => {
      const arr = await Promise.all(
        (group.members || []).map(async (uid: string) => {
          const snap = await getDoc(doc(db, 'users', uid));
          return { id: uid, ...(snap.exists() ? snap.data() : {}) };
        })
      );
      if (active) setMembers(arr);
    };
    load();
    return () => {
      active = false;
    };
  }, [group]);

  const renderItem = ({ item }: { item: any }) => (
    <PersonCard
      user={item}
      onPress={() => setSelected(item.id)}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title={group?.name || 'Group'}
        onBack={navigation.goBack}
        right={
          group?.owner === auth.currentUser?.uid ? (
            <TouchableOpacity onPress={() => navigation.navigate('EditGroup', { id })}>
              <Text style={styles.edit}>Edit</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />
      {group && (
        <>
          {group.description ? (
            <Text style={styles.desc}>{group.description}</Text>
          ) : null}
          <Text style={styles.owner}>{`Owner: ${members.find(m => m.id === group.owner)?.first || ''} ${members.find(m => m.id === group.owner)?.last || ''}`}</Text>
          <FlatList
            data={members}
            renderItem={renderItem}
            keyExtractor={m => m.id}
          />
        </>
      )}
      <MemberDrawer
        uid={selected}
        visible={!!selected}
        groupOwner={group?.owner === auth.currentUser?.uid}
        onClose={() => setSelected(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  row: { paddingVertical: spacing.s, borderBottomWidth: 1, borderColor: '#eee' },
  owner: { marginBottom: spacing.m },
  desc: { marginBottom: spacing.m, color: '#666' },
  edit: { color: colors.primary, fontWeight: '600' },
});
