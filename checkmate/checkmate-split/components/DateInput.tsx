import React from 'react';
import {
  Platform,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { colors, spacing } from '../constants';

interface Props {
  value: Date;
  onChange: (d: Date) => void;
  style?: StyleProp<ViewStyle>;
}

export default function DateInput({ value, onChange, style }: Props) {
  const openAndroid = () => {
    DateTimePickerAndroid.open({
      mode: 'date',
      value,
      onChange: (_e, date) => {
        if (date) onChange(date);
      },
    });
  };

  if (Platform.OS === 'ios') {
    return (
      <DateTimePicker
        mode="date"
        value={value}
        display="compact"
        onChange={(e, d) => d && onChange(d)}
        style={[styles.ios, style]}
      />
    );
  }

  return (
    <TouchableOpacity onPress={openAndroid} activeOpacity={0.8}>
      <TextInput
        pointerEvents="none"
        editable={false}
        value={value.toLocaleDateString()}
        style={[styles.input, style]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ios: {
    marginTop: spacing.m,
    alignSelf: 'stretch',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    padding: spacing.m,
    marginTop: spacing.m,
    backgroundColor: colors.primaryBackground,
  },
});
