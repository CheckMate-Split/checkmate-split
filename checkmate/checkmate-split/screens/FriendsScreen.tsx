import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, FlatList, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import Button from '../components/Button';
import AddFriendDrawer from '../components/AddFriendDrawer';
import AddFriendQRDrawer from '../components/AddFriendQRDrawer';
import PersonCard from '../components/PersonCard';
import GroupCard from '../components/GroupCard';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { useNavigation } from '@react-navigation/native';
import { db, auth, functions } from '../firebaseConfig';
import { colors, spacing } from '../constants';

export default function FriendsScreen() {
  const navigation = useNavigation<any>();
  const [tab, setTab] = useState<'friends' | 'groups'>('friends');
  const [addVisible, setAddVisible] = useState(false);
  const [qrVisible, setQrVisible] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [groupInvites, setGroupInvites] = useState<any[]>([]);

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
    const uid = auth.currentUser!.uid;
    const unsub = onSnapshot(collection(db, 'users', uid, 'friendRequests'), async snap => {
      const arr = await Promise.all(
        snap.docs.map(async d => {
          const p = await getDoc(doc(db, 'users', d.id));
          return { id: d.id, ...(p.exists() ? p.data() : {}) };
        })
      );
      setRequests(arr);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const uid = auth.currentUser!.uid;
    const unsub = onSnapshot(collection(db, 'users', uid, 'sentRequests'), async snap => {
      const arr = await Promise.all(
        snap.docs.map(async d => {
          const p = await getDoc(doc(db, 'users', d.id));
          return { id: d.id, ...(p.exists() ? p.data() : {}) };
        })
      );
      setSent(arr);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users', auth.currentUser!.uid, 'groups'),
      async snap => {
        const arr = await Promise.all(
          snap.docs.map(async d => {
            const g = await getDoc(doc(db, 'groups', d.id));
            return { id: d.id, ...(g.exists() ? g.data() : {}) };
          })
        );
        setGroups(arr);
      }
    );
    return unsub;
  }, []);

  useEffect(() => {
    const uid = auth.currentUser!.uid;
    const unsub = onSnapshot(collection(db, 'users', uid, 'groupInvites'), async snap => {
      const arr = await Promise.all(
        snap.docs.map(async d => {
          const g = await getDoc(doc(db, 'groups', d.id));
          return { id: d.id, ...(g.exists() ? g.data() : {}), from: d.data().from };
        })
      );
      setGroupInvites(arr);
    });
    return unsub;
  }, []);

  const uid = auth.currentUser?.uid || '';
  const link = `checkmate://add-friend?uid=${uid}`;

  const shareLink = () => {
    Share.share({ message: link });
  };

  const openAdd = () => {
    if (tab === 'friends') setAddVisible(true);
    else navigation.navigate('AddGroup');
  };

  const acceptRequest = async (uid: string, accept: boolean) => {
    try {
      const fn = httpsCallable(functions, 'respondFriendRequest');
      await fn({ from: uid, accept });
    } catch (e) {
      console.error(e);
    }
  };

  const withdrawRequest = async (uid: string) => {
    try {
      const fn = httpsCallable(functions, 'withdrawFriendRequest');
      await fn({ to: uid });
    } catch (e) {
      console.error(e);
    }
  };

  const respondGroup = async (gid: string, accept: boolean) => {
    try {
      const fn = httpsCallable(functions, 'respondGroupInvite');
      await fn({ groupId: gid, accept });
    } catch (e) {
      console.error(e);
    }
  };

  const renderFriend = ({ item }: { item: any }) => (
    <PersonCard
      user={item}
      onPress={() =>
        navigation.navigate('FriendDetail', { uid: item.id, name: `${item.first} ${item.last}` })
      }
    />
  );

  const renderRequest = ({ item }: { item: any }) => (
    <View style={styles.inviteCard}>
      <Text style={styles.inviteName}>{item.first ? `${item.first} ${item.last}` : item.id}</Text>
      <View style={styles.inviteActions}>
        <TouchableOpacity onPress={() => acceptRequest(item.id, true)} style={styles.smallBtn}>
          <Text style={styles.btnText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => acceptRequest(item.id, false)} style={styles.smallBtn}>
          <Text style={styles.btnText}>Deny</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSentReq = ({ item }: { item: any }) => (
    <View style={styles.inviteCard}>
      <Text style={styles.inviteName}>{item.first ? `${item.first} ${item.last}` : item.id}</Text>
      <TouchableOpacity onPress={() => withdrawRequest(item.id)} style={styles.smallBtn}>
        <Text style={styles.btnText}>Withdraw</Text>
      </TouchableOpacity>
    </View>
  );

  const renderGroup = ({ item }: { item: any }) => (
    <GroupCard
      group={item}
      onPress={() => navigation.navigate('GroupDetail', { id: item.id })}
    />
  );

  const renderGroupInvite = ({ item }: { item: any }) => (
    <View style={styles.inviteCard}>
      <Text style={styles.inviteName}>{item.name || item.id}</Text>
      <View style={styles.inviteActions}>
        <TouchableOpacity onPress={() => respondGroup(item.id, true)} style={styles.smallBtn}>
          <Text style={styles.btnText}>Join</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => respondGroup(item.id, false)} style={styles.smallBtn}>
          <Text style={styles.btnText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
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
        <>
          {requests.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Invites Received</Text>
              <FlatList data={requests} renderItem={renderRequest} keyExtractor={i => i.id} />
            </>
          )}
          {sent.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Invites Sent</Text>
              <FlatList data={sent} renderItem={renderSentReq} keyExtractor={i => i.id} />
            </>
          )}
          <FlatList
            data={friends}
            renderItem={renderFriend}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.empty}>no friends yet</Text>}
          />
        </>
      ) : (
        <>
          {groupInvites.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Group Invites</Text>
              <FlatList data={groupInvites} renderItem={renderGroupInvite} keyExtractor={i => i.id} />
            </>
          )}
          <FlatList
            data={groups}
            renderItem={renderGroup}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.empty}>no groups yet</Text>}
          />
        </>
      )}
      <View style={styles.footer}>
        <Button title={tab === 'friends' ? 'Add Friend' : 'Add Group'} onPress={openAdd} />
      </View>
      <AddFriendDrawer
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        onSearch={() => navigation.navigate('AddFriendSearch')}
        onQr={() => setQrVisible(true)}
        onLink={shareLink}
      />
      <AddFriendQRDrawer visible={qrVisible} onClose={() => setQrVisible(false)} />
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
  sectionTitle: { marginTop: spacing.m, marginBottom: spacing.s, fontWeight: '600' },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryBackground,
    padding: spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: spacing.s,
  },
  inviteName: { fontSize: 18, fontWeight: '600', color: colors.text },
  inviteActions: { flexDirection: 'row' },
  smallBtn: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.m,
    borderRadius: 16,
    marginLeft: spacing.s / 2,
  },
  btnText: { color: colors.primary, fontWeight: '500' },
});
