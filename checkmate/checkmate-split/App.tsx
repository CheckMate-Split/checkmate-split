import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Image, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebaseConfig';
import Button from './components/Button';
import Text from './components/Text';
import { colors, spacing } from './constants';

export default function App() {
  const [result, setResult] = useState<any>(null);
  const [image, setImage] = useState<string | null>(null);

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
      const scan = httpsCallable(functions, 'scanReceipt');
      const res = await scan({ image: base64 });
      setResult(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Scan Receipt" onPress={handleScan} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {result && <Text>{JSON.stringify(result, null, 2)}</Text>}
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
});
