import React from 'react';
import { Text as RNText, StyleSheet, TextProps } from 'react-native';
import { colors } from '../constants';

export default function Text(props: TextProps) {
  return <RNText {...props} style={[styles.text, props.style]} />;
}

const styles = StyleSheet.create({
  text: {
    color: colors.text,
  },
});
