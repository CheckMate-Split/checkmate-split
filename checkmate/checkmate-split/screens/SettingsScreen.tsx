import React from 'react';
import { StyleSheet, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import PageHeader from '../components/PageHeader';
import MenuItem from '../components/MenuItem';
import { colors, spacing } from '../constants';
import { auth } from '../firebaseConfig';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.avatar} />
      <PageHeader title="Settings" />
      <MenuItem
        title="Account"
        icon="person"
        onPress={() => navigation.navigate('Account')}
      />
      <MenuItem
        title="Payment Methods"
        icon="card"
        onPress={() => navigation.navigate('PaymentMethods')}
      />
      <MenuItem
        title="Notifications"
        icon="notifications"
        onPress={() => navigation.navigate('Notifications')}
      />
      <MenuItem
        title="Terms & Privacy"
        icon="document-text"
        onPress={() => navigation.navigate('Terms')}
      />
      <MenuItem
        title="Support & FAQ"
        icon="help-circle"
        onPress={() => navigation.navigate('Support')}
      />
      <MenuItem
        title="Logout"
        icon="log-out"
        onPress={handleLogout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#ccc',
    alignSelf: 'center',
    marginTop: spacing.l,
  },
});
