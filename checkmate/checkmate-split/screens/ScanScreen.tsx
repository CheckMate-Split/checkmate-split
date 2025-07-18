import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { httpsCallable } from 'firebase/functions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { functions, auth } from '../firebaseConfig';
import { Buffer } from 'buffer';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import Text from '../components/Text';
import { colors, spacing } from '../constants';
import BottomDrawer from '../components/BottomDrawer';

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const cameraRef = useRef<Camera | null>(null);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [captured, setCaptured] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    } else if (!permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    const result = await cameraRef.current.takePictureAsync({ quality: 1, base64: true });
    setCaptured(result);
  };

  const handleUse = async () => {
    if (!captured || !auth.currentUser) return;
    setLoading(true);
    try {
      const token = await auth.currentUser.getIdToken();
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      console.log('Token aud', payload.aud);
      const scan = httpsCallable(functions, 'parseReciept');
      const res: any = await scan({ image: captured.base64 });
      const parsed = res.data?.data ?? res.data;
      navigation.navigate('CreateReceipt', { data: parsed, image: captured.base64 });
    } catch (e: any) {
      console.error(e);
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setCaptured(null);
    setError(null);
  };

  const handleManual = () => {
    navigation.navigate('CreateReceipt', { data: {}, image: '', manual: true });
  };

  return (
    <SafeAreaView style={styles.container}>
      {!captured ? (
        <Camera
          ref={cameraRef}
          style={styles.camera}
          ratio="16:9"
          type={CameraType.back}
        />
      ) : (
        <Image source={{ uri: captured.uri }} style={styles.camera} />
      )}
      {!captured ? (
        <TouchableOpacity style={styles.capture} onPress={takePhoto} />
      ) : (
        <View style={styles.confirmRow}>
          <OutlineButton title="Retake" onPress={() => setCaptured(null)} style={styles.confirmButton} />
          <Button title="Use Photo" onPress={handleUse} style={styles.confirmButton} />
        </View>
      )}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
      <BottomDrawer
        visible={!!error}
        mode="scan"
        onRetry={handleRetry}
        onManual={handleManual}
        onClose={() => setError(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  camera: { flex: 1 },
  capture: {
    position: 'absolute',
    bottom: spacing.l,
    alignSelf: 'center',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: '#fff',
    backgroundColor: '#fff',
  },
  confirmRow: {
    position: 'absolute',
    bottom: spacing.l,
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: spacing.m,
    justifyContent: 'space-between',
  },
  confirmButton: { flex: 1, marginHorizontal: spacing.s / 2 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.petalGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
