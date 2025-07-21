import React from 'react';
import { StyleSheet, Share, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { auth } from '../firebaseConfig';
import PageHeader from '../components/PageHeader';
import OutlineButton from '../components/OutlineButton';
import { colors, spacing } from '../constants';

export default function AddFriendQRScreen() {
  const navigation = useNavigation<any>();
  const uid = auth.currentUser?.uid || '';
  const link = `checkmate://add-friend?uid=${uid}`;
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="My QR Code" onBack={navigation.goBack} />
      <View style={styles.content}>
        <QRCode value={link} size={220} />
        <OutlineButton
          title="Share Link"
          onPress={() => Share.share({ message: link })}
          style={styles.button}
          icon="share"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.m },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  button: { marginTop: spacing.l, alignSelf: 'center' },
});
