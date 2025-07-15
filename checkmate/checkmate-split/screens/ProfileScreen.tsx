import React from 'react';
import { StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import MenuItem from '../components/MenuItem';
import { colors, spacing } from '../constants';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  return (
    <SafeAreaView style={styles.container}>
      <Image source={require('../assets/icon.png')} style={styles.avatar} />
      <PageHeader title="Profile" />
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

