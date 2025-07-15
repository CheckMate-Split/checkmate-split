import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../constants';

interface Props {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
}

export default function OutlineButton({ title, onPress, style }: Props) {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    borderWidth: 1,
    padding: spacing.m,
    borderRadius: 4,
  },
  text: {
    color: colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
