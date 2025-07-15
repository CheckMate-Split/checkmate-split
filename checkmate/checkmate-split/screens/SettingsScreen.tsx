import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import PageHeader from '../components/PageHeader';
import MenuItem from '../components/MenuItem';
import { colors } from '../constants';
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
    <View style={styles.container}>
      <PageHeader title="Settings" />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
