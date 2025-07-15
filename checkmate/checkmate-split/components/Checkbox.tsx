import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants';


interface Props {
  value: boolean;
  onValueChange: (v: boolean) => void;
  style?: StyleProp<ViewStyle>;
}

export default function Checkbox({ value, onValueChange, style }: Props) {
  return (
    <TouchableOpacity
      style={[styles.box, style, value && styles.checked]}
      onPress={() => onValueChange(!value)}
    >
      {value && <Ionicons name="checkmark" size={16} color="#fff" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBackground,
  },
  checked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});
