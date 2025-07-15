import React, { useEffect, useState } from 'react';
import {
  Platform,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  View,
  ViewStyle,
  StyleProp,
} from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants';

interface Props {
  value: Date;
  onChange: (d: Date) => void;
  style?: StyleProp<ViewStyle>;
}

export default function DateInput({ value, onChange, style }: Props) {
  const [showIOS, setShowIOS] = useState(false);
  const [text, setText] = useState(formatDate(value));

  useEffect(() => {
    setText(formatDate(value));
  }, [value]);

  const openPicker = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        mode: 'date',
        value,
        onChange: (_e, date) => date && onChange(date),
      });
    } else {
      setShowIOS(true);
    }
  };

  const handleIOS = (_e: any, d?: Date) => {
    if (d) onChange(d);
    setShowIOS(false);
  };

  const handleTextChange = (t: string) => {
    setText(t);
    const parsed = new Date(t);
    if (!isNaN(parsed.getTime())) {
      onChange(parsed);
    }
  };

  return (
    <View>
      <View style={[styles.inputContainer, style]}>
        <TextInput
          value={text}
          onChangeText={handleTextChange}
          placeholder="MM/DD/YYYY"
          keyboardType="numbers-and-punctuation"
          style={styles.input}
        />
        <TouchableOpacity onPress={openPicker} style={styles.iconButton}>
          <Ionicons name="calendar" size={20} color="#555" />
        </TouchableOpacity>
      </View>
      {showIOS && Platform.OS === 'ios' && (
        <DateTimePicker
          mode="date"
          value={value}
          display="spinner"
          onChange={handleIOS}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: colors.primaryBackground,
    marginTop: spacing.m,
  },
  input: {
    flex: 1,
    padding: spacing.m,
  },
  iconButton: {
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
});

function formatDate(d: Date) {
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}/${dd}/${d.getFullYear()}`;
}
