import React from 'react';
import { TouchableOpacity, StyleSheet, View, Image } from 'react-native';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  user: any;
  onPress?: () => void;
}

export default function PersonCard({ user, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
    >
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBackground,
    padding: spacing.m,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: spacing.s,
  },
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
