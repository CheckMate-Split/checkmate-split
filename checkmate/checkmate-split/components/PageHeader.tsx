import React from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  title: string;
}

export default function PageHeader({ title }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.divider} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.l,
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
    marginTop: spacing.m,
  },
});
