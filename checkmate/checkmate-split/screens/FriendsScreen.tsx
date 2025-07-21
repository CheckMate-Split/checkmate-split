import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import Button from '../components/Button';
import AddFriendDrawer from '../components/AddFriendDrawer';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { db, auth } from '../firebaseConfig';
import { colors, spacing } from '../constants';

export default function FriendsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<'friends' | 'groups'>('friends');
  const [addVisible, setAddVisible] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users', auth.currentUser!.uid, 'friends'),
      async snap => {
        const arr = await Promise.all(
          snap.docs.map(async d => {
            const p = await getDoc(doc(db, 'users', d.id));
            return { id: d.id, ...(p.exists() ? p.data() : {}) };
          })
        );
        setFriends(arr);
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users', auth.currentUser!.uid, 'groups'),
      snap => setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  const openAdd = () => {
    if (tab === 'friends') setAddVisible(true);
    else navigation.navigate('AddGroup');
  };

  const renderFriend = ({ item }: { item: any }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('FriendDetail', { uid: item.id, name: `${item.first} ${item.last}` })
      }
      style={styles.row}
    >
      <Text>{item.first ? `${item.first} ${item.last}` : item.id}</Text>
    </TouchableOpacity>
  );

  const renderGroup = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => navigation.navigate('GroupDetail', { id: item.id })} style={styles.row}>
      <Text>{item.name || item.id}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Friends" noTopMargin />
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab('friends')}
          style={[styles.tab, tab === 'friends' && styles.tabSelected]}
        >
          <Text style={[styles.tabText, tab === 'friends' && styles.tabTextSelected]}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('groups')}
          style={[styles.tab, tab === 'groups' && styles.tabSelected]}
        >
          <Text style={[styles.tabText, tab === 'groups' && styles.tabTextSelected]}>Groups</Text>
        </TouchableOpacity>
      </View>
      {tab === 'friends' ? (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.empty}>no friends yet</Text>}
        />
      ) : (
        <FlatList
          data={groups}
          renderItem={renderGroup}
          keyExtractor={item => item.id}
          ListEmptyComponent={<Text style={styles.empty}>no groups yet</Text>}
        />
      )}
      <View style={styles.footer}>
        <Button title={tab === 'friends' ? 'Add Friend' : 'Add Group'} onPress={openAdd} />
      </View>
      <AddFriendDrawer
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSearch={() => navigation.navigate('AddFriendSearch')}
        onQr={() => navigation.navigate('AddFriendQR')}
        onLink={() => navigation.navigate('AddFriendQR')}
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
  empty: {
    marginTop: spacing.m,
    textAlign: 'center',
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
  footer: {
    marginTop: 'auto',
  },
  row: {
    paddingVertical: spacing.s,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
});
