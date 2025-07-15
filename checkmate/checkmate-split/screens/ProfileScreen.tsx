import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PageHeader from '../components/PageHeader';
import MenuItem from '../components/MenuItem';
import { colors, spacing } from '../constants';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
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
    </View>
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
    alignSelf: 'center',
    marginTop: spacing.l,
  },
});

