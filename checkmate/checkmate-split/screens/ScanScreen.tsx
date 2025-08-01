import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { httpsCallable } from 'firebase/functions';
import { SafeAreaView } from 'react-native-safe-area-context';
import { functions, auth } from '../firebaseConfig';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import { colors, spacing } from '../constants';
import BottomDrawer from '../components/BottomDrawer';
import Text from '../components/Text';

export type ScanParams = { Scan: { groupId?: string } };

export default function ScanScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ScanParams, 'Scan'>>();
  const groupId = route.params?.groupId;
  const [captured, setCaptured] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const openCamera = async () => {
    const res = await ImagePicker.launchCameraAsync({
      quality: 1,
      base64: true,
      allowsEditing: true,
    });
    if (!res.canceled) {
      setCaptured(res.assets[0]);
    }
  };

  useEffect(() => {
    openCamera();
  }, []);

  const handleUse = async () => {
    if (!captured || !auth.currentUser) return;
    const bytes = (captured.base64.length * 3) / 4;
    if (bytes > 20 * 1024 * 1024) {
      setError(new Error('Image too large'));
      return;
    }
    setLoading(true);
    try {
      const scan = httpsCallable(functions, 'parseReciept');
      const res: any = await scan({ image: captured.base64 });
      console.log('scan response', JSON.stringify(res, null, 2));
      console.log(
        'product line items',
        JSON.stringify(
          res.data?.data?.entities?.productLineItems ||
            res.data?.entities?.productLineItems ||
            [],
          null,
          2
        )
      );
      console.log('scan date', res.data?.data?.date?.data || res.data?.date?.data);
      const parsed = res.data?.data ?? res.data;
      navigation.navigate('CreateReceipt', { data: parsed, image: captured.base64, groupId });
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
    openCamera();
  };

  const handleManual = () => {
    navigation.navigate('CreateReceipt', { data: {}, image: '', manual: true, groupId });
  };

  return (
    <SafeAreaView style={styles.container}>
      {captured ? (
        <Image source={{ uri: captured.uri }} style={styles.image} />
      ) : (
        <View style={styles.placeholder} />
      )}
      {captured && (
        <View style={styles.confirmRow}>
          <OutlineButton title="Retake" onPress={openCamera} style={styles.confirmButton} />
          <Button title="Use Photo" onPress={handleUse} style={styles.confirmButton} />
        </View>
      )}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Processing reciept…</Text>
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
  image: { flex: 1 },
  placeholder: { flex: 1, backgroundColor: '#000' },
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
  loadingText: {
    marginTop: spacing.m,
    fontWeight: 'bold',
  },
});
