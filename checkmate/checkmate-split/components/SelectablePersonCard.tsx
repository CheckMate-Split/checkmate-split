import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import Text from './Text';
import Checkbox from './Checkbox';
import { colors, spacing } from '../constants';

interface Props {
  user: any;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

export default function SelectablePersonCard({ user, value, onValueChange }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.iconWrapper}>
          {user.photo ? (
            <Image source={{ uri: user.photo }} style={styles.avatar} />
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{user.first} {user.last}</Text>
          <Text style={styles.username}>@{user.username}</Text>
        </View>
      </View>
      <Checkbox value={value} onValueChange={onValueChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryBackground,
    padding: spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: spacing.s,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.m,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  placeholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ccc',
  },
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600', color: colors.text },
  username: { color: '#666' },
});
