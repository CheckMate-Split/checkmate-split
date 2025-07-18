import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Image, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import DocumentScanner, {
  ResponseType,
  ScanDocumentResponseStatus,
} from 'react-native-document-scanner-plugin';
import { httpsCallable } from 'firebase/functions';
import { useNavigation } from '@react-navigation/native';
import { functions, auth } from '../firebaseConfig';
import { Buffer } from 'buffer';
import Button from '../components/Button';
import OutlineButton from '../components/OutlineButton';
import { colors, spacing } from '../constants';
import Text from '../components/Text';

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  const [logoSize, setLogoSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const { width: screenWidth } = Dimensions.get('window');
    const asset = Image.resolveAssetSource(require('../assets/logo-full.jpeg'));
    const targetWidth = screenWidth * 0.9;
    const targetHeight = (asset.height / asset.width) * targetWidth;
    setLogoSize({ width: targetWidth, height: targetHeight });
  }, []);

  const handleScan = async () => {
    if (!auth.currentUser) {
      return;
    }
    console.log('Scanning as', auth.currentUser.uid);
    console.log('Functions project', functions.app.options.projectId);
    const token = await auth.currentUser.getIdToken();
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    console.log('Token aud', payload.aud);
    try {
      const { scannedImages, status } = await DocumentScanner.scanDocument({
        responseType: ResponseType.Base64,
      });
      if (
        status !== ScanDocumentResponseStatus.Success ||
        !scannedImages ||
        scannedImages.length === 0
      ) {
        return;
      }
      const base64 = scannedImages[0];

      const scan = httpsCallable(functions, 'parseReciept');
      const res = await scan({ image: base64 });
      navigation.navigate('CreateReceipt', { data: res.data, image: base64 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async () => {
    if (!auth.currentUser) {
      return;
    }
    console.log('Scanning as', auth.currentUser.uid);
    console.log('Functions project', functions.app.options.projectId);
    const upToken = await auth.currentUser.getIdToken();
    const upPayload = JSON.parse(Buffer.from(upToken.split('.')[1], 'base64').toString());
    console.log('Token aud', upPayload.aud);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const pick = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (pick.canceled) return;
    const base64 = pick.assets[0].base64 as string;
    try {
      const scan = httpsCallable(functions, 'parseReciept');
      const res = await scan({ image: base64 });
      navigation.navigate('CreateReceipt', { data: res.data, image: base64 });
    } catch (e) {
      console.error(e);
    }
  };

  const handleManual = () => {
    navigation.navigate('CreateReceipt', { data: {}, image: '', manual: true });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Image
        source={require('../assets/logo-full.jpeg')}
        style={[styles.logo, { width: logoSize.width, height: logoSize.height }]}
        resizeMode="contain"
      />
      <Text style={styles.tagline}>Pay Your Part</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      <View style={styles.footer}>
        <Button title="Scan Receipt" onPress={handleScan} style={styles.scanButton} />
        <View style={styles.extraRow}>
          <OutlineButton
            title="Upload Receipt"
            onPress={handleUpload}
            style={[styles.extraButton, { marginRight: spacing.s / 2 }]}
          />
          <OutlineButton
            title="Enter Manually"
            onPress={handleManual}
            style={[styles.extraButton, { marginLeft: spacing.s / 2 }]}
          />
        </View>
      </View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.background,
  },
  footer: {
    padding: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.l,
  },
  logo: {
    width: '90%',
  },
  tagline: {
    marginTop: spacing.s,
    fontWeight: '500',
    fontSize: 24,
  },
  scanButton: {
    width: '90%',
    alignSelf: 'center',
  },
  extraRow: {
    flexDirection: 'row',
    marginTop: spacing.m,
    width: '90%',
  },
  extraButton: {
    flex: 1,
  },
});

