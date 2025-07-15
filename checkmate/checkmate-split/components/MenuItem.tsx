import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  title: string;
  onPress: () => void;
  icon?: string;
  subText?: string;
  subTextColor?: string;
  subIcon?: string;
}

export default function MenuItem({
  title,
  onPress,
  icon,
  subText,
  subTextColor,
  subIcon,
}: Props) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      {icon && <Ionicons name={icon as any} size={24} style={styles.icon} />}
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subText && (
          <View style={styles.subRow}>
            {subIcon && (
              <Ionicons
                name={subIcon as any}
                size={16}
                color={subTextColor || colors.text}
                style={styles.subIcon}
              />
            )}
            <Text style={[styles.subText, { color: subTextColor || colors.text }]}> 
              {subText}
            </Text>
          </View>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.l,
    paddingHorizontal: spacing.m,
    backgroundColor: colors.primaryBackground,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  icon: {
    marginRight: spacing.m,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.s / 2,
  },
  subIcon: {
    marginRight: spacing.s / 2,
  },
  subText: {
    fontSize: 16,
  },
  chevron: {
    marginLeft: spacing.m,
  },
});
