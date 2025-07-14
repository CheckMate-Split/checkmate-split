import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { httpsCallable } from 'firebase/functions';
import { useNavigation } from '@react-navigation/native';
import { auth, db, functions } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import Button from '../components/Button';
import { colors, spacing } from '../constants';
import Text from '../components/Text';
import ReceiptCard from '../components/ReceiptCard';

export default function ScanScreen() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    if (!auth.currentUser) {
      signInAnonymously(auth).catch(console.error);
    }
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'receipts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, snap => {
      setReceipts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handleScan = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const capture = await ImagePicker.launchCameraAsync({ base64: true });
    if (capture.canceled) return;
    const base64 = capture.assets[0].base64 as string;

    try {
      const scan = httpsCallable(functions, 'scanReceipt');
      const res = await scan({ image: base64 });
      navigation.navigate('CreateReceipt', { data: res.data, image: base64 });
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <ReceiptCard
      receipt={item}
      onPress={() => navigation.navigate('Receipt', { id: item.id, receipt: item })}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={receipts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={receipts.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            no receipts yet, click scan receipt to split the bill
          </Text>
        }
      />
      <View style={styles.footer}>
        <Button title="Scan Receipt" onPress={handleScan} style={styles.scanButton} />
      </View>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.m,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.m,
  },
  footer: {
    padding: spacing.m,
    alignItems: 'center',
  },
  scanButton: {
    width: '90%',
    alignSelf: 'center',
  },
});

