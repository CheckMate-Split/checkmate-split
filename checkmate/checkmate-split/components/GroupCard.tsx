import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  group: any;
  onPress?: () => void;
}

export default function GroupCard({ group, onPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name="people" size={24} color={colors.primary} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{group.name}</Text>
        <Text style={styles.desc}>{(group.members?.length || 0)} members</Text>
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
  info: { flex: 1 },
  name: { fontSize: 18, fontWeight: '600' },
  desc: { color: '#666', marginTop: spacing.s / 2 },
});
