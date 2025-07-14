import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { httpsCallable } from 'firebase/functions';
import { useNavigation } from '@react-navigation/native';
import { auth, db, storage, functions } from '../firebaseConfig';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadString } from 'firebase/storage';
import Button from '../components/Button';
import { colors, spacing } from '../constants';
import Text from '../components/Text';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [receipts, setReceipts] = useState<any[]>([]);
  const navigation = useNavigation();

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
    setImage(capture.assets[0].uri);

    try {
      const docRef = await addDoc(collection(db, 'receipts'), {
        payer: auth.currentUser ? auth.currentUser.uid : null,
        createdAt: serverTimestamp(),
      });

      const storageRef = ref(storage, `receipts/${docRef.id}.jpg`);
      await uploadString(storageRef, base64, 'base64');

      const scan = httpsCallable(functions, 'scanReceipt');
      const res = await scan({ image: base64 });

      await updateDoc(docRef, { data: res.data });
      navigation.navigate('Confirm', { result: res.data });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Scan Receipt" onPress={handleScan} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {receipts.map(r => (
        <Text key={r.id} style={styles.receipt}>{r.data?.merchantName || r.id}</Text>
      ))}
      <StatusBar style="dark" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.m,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: spacing.m,
    resizeMode: 'contain',
  },
  receipt: {
    marginTop: spacing.m,
  },
});

