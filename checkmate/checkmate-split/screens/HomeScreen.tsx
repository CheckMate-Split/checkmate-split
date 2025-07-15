import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, FlatList, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { httpsCallable } from 'firebase/functions';
import { useNavigation } from '@react-navigation/native';
import { db, functions } from '../firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import { colors, spacing } from '../constants';
import Text from '../components/Text';
import ReceiptCard from '../components/ReceiptCard';

export default function HomeScreen() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const navigation = useNavigation<any>();


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

  const handleUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const pick = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (pick.canceled) return;
    const base64 = pick.assets[0].base64 as string;
    try {
      const scan = httpsCallable(functions, 'scanReceipt');
      const res = await scan({ image: base64 });
      navigation.navigate('CreateReceipt', { data: res.data, image: base64 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleManual = () => {
    navigation.navigate('CreateReceipt', { data: {}, image: '' });
  };

  const renderItem = ({ item }: { item: any }) => (
    <ReceiptCard
      receipt={item}
      onPress={() => navigation.navigate('Receipt', { id: item.id, receipt: item })}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Image
        source={require('../assets/icon.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Pay Your Part</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={receipts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={receipts.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            no receipts yet, click scan receipt to split the bill
          </Text>
        }
      />
      <View style={styles.footer}>
        <Button title="Scan Receipt" onPress={handleScan} style={styles.scanButton} />
        <View style={styles.extraRow}>
          <OutlineButton title="Upload Receipt" onPress={handleUpload} style={styles.extraButton} />
          <OutlineButton title="Enter Manually" onPress={handleManual} style={styles.extraButton} />
        </View>
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
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginVertical: spacing.l,
  },
  logo: {
    width: '90%',
    height: 80,
  },
  tagline: {
    marginTop: spacing.s,
    fontWeight: '500',
  },
  scanButton: {
    width: '90%',
    alignSelf: 'center',
  },
  extraRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    width: '90%',
  },
  extraButton: {
    flex: 1,
    marginHorizontal: spacing.s,
  },
});

