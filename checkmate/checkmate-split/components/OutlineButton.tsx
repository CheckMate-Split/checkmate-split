import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, ViewStyle, StyleProp, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '../constants';

interface Props {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
}

export default function OutlineButton({ title, onPress, style, icon, disabled, loading }: Props) {
  return (
    <TouchableOpacity
      style={[styles.button, style, (disabled || loading) && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <>
            {icon && (
              <Ionicons name={icon as any} size={20} color={colors.text} style={styles.icon} />
            )}
            <Text style={styles.text}>{title}</Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primaryBackground,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: spacing.l,
    borderRadius: 8,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: spacing.s,
  },
  text: {
    color: colors.text,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
});
