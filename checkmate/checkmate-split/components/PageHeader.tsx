import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
  noTopMargin?: boolean;
}

export default function PageHeader({ title, onBack, right, noTopMargin }: Props) {
  return (
    <View style={[styles.container, noTopMargin && styles.noMarginTop]}>
      <View style={styles.row}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{title}</Text>
        {right ? (
          <View style={styles.right}>{right}</View>
        ) : (
          onBack && <View style={styles.placeholder} />
        )}
      </View>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    marginBottom: spacing.l,
  },
  noMarginTop: {
    marginTop: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: spacing.l,
  },
  placeholder: {
    width: 28,
    position: 'absolute',
    right: spacing.l,
  },
  right: {
    position: 'absolute',
    right: spacing.l,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    alignSelf: 'stretch',
    marginTop: spacing.l,
  },
});
