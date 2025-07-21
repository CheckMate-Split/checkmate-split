import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { doc, onSnapshot } from 'firebase/firestore';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import MemberDrawer from '../components/MemberDrawer';
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

  useEffect(() => {
    return onSnapshot(doc(db, 'groups', id), snap => setGroup(snap.data() || null));
  }, [id]);

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity onPress={() => setSelected(item)} style={styles.row}>
      <Text>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title={group?.name || 'Group'} onBack={navigation.goBack} />
      {group && (
        <>
          <Text style={styles.owner}>{`Owner: ${group.owner}`}</Text>
          <FlatList
            data={group.members}
            renderItem={renderItem}
            keyExtractor={m => m}
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
});
