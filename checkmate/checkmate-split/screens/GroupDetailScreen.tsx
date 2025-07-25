import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import MemberDrawer from '../components/MemberDrawer';
import PersonCard from '../components/PersonCard';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import { Ionicons } from '@expo/vector-icons';
import { db, auth, functions } from '../firebaseConfig';
import { httpsCallable } from 'firebase/functions';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing } from '../constants';
import NewReceiptDrawer from '../components/NewReceiptDrawer';

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
  const [drawerVisible, setDrawerVisible] = useState(false);

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
      onPress={
        item.id === auth.currentUser?.uid ? undefined : () => setSelected(item.id)
      }
      tag={item.id === group?.owner ? 'owner' : undefined}
    />
  );

  const leave = async () => {
    try {
      const fn = httpsCallable(functions, 'leaveGroup');
      await fn({ groupId: id });
      navigation.goBack();
    } catch (e) {
      console.error(e);
    }
  };

  const confirmLeave = () => {
    Alert.alert('Leave Group', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: leave },
    ]);
  };

  const startScan = () => {
    setDrawerVisible(false);
    navigation.navigate('Tabs', {
      screen: 'HomeTab',
      params: { screen: 'Scan', params: { groupId: id } },
    });
  };

  const startManual = () => {
    setDrawerVisible(false);
    navigation.navigate('Tabs', {
      screen: 'HomeTab',
      params: {
        screen: 'CreateReceipt',
        params: { data: {}, image: '', manual: true, groupId: id },
      },
    });
  };

  const startUpload = async () => {
    setDrawerVisible(false);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const pick = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (pick.canceled) return;
    const base64 = pick.assets[0].base64 as string;
    try {
      const scan = httpsCallable(functions, 'parseReciept');
      const res: any = await scan({ image: base64 });
      const parsed = res.data?.data ?? res.data;
      navigation.navigate('Tabs', {
        screen: 'HomeTab',
        params: {
          screen: 'CreateReceipt',
          params: { data: parsed, image: base64, groupId: id },
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        title={group?.name || 'Group'}
        onBack={navigation.goBack}
        right={
          group?.owner === auth.currentUser?.uid ? (
            <TouchableOpacity onPress={() => navigation.navigate('EditGroup', { id })}>
              <Ionicons name="pencil" size={20} color={colors.text} />
            </TouchableOpacity>
          ) : undefined
        }
      />
      {group && (
        <>
          {group.description ? (
            <Text style={styles.desc}>{group.description}</Text>
          ) : null}
          <Text style={styles.section}>Members</Text>
          <FlatList
            data={members}
            renderItem={renderItem}
            keyExtractor={m => m.id}
          />
          <View style={styles.actions}>
            <Button title="Send Request" onPress={() => setDrawerVisible(true)} style={styles.actionBtn} />
            {group.owner === auth.currentUser?.uid && (
              <OutlineButton
                title="Add Friends"
                onPress={() => navigation.navigate('AddGroupMembers', { id })}
                style={styles.actionBtn}
              />
            )}
            {group.owner !== auth.currentUser?.uid && (
              <OutlineButton
                title="Leave Group"
                onPress={confirmLeave}
                style={styles.actionBtn}
              />
            )}
          </View>
        </>
      )}
      <MemberDrawer
        uid={selected}
        visible={!!selected}
        groupOwner={group?.owner === auth.currentUser?.uid}
        onClose={() => setSelected(null)}
      />
      <NewReceiptDrawer
        visible={drawerVisible}
        onScan={startScan}
        onUpload={startUpload}
        onManual={startManual}
        onClose={() => setDrawerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  row: { paddingVertical: spacing.s, borderBottomWidth: 1, borderColor: '#eee' },
  desc: { marginBottom: spacing.m, color: '#666' },
  edit: { color: colors.primary },
  section: { marginBottom: spacing.s, fontWeight: '600' },
  actions: { marginTop: spacing.m },
  actionBtn: { marginTop: spacing.s },
});
