import React, { useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View, TextInput } from 'react-native';
import Button from './Button';
import OutlineButton from './OutlineButton';
import Text from './Text';
import { colors, spacing } from '../constants';

interface Props {
  visible: boolean;
  onSplitEqual: () => void;
  onClaimPortion: (percent: number) => void;
  onClose: () => void;
}

export default function SplitDrawer({
  visible,
  onSplitEqual,
  onClaimPortion,
  onClose,
}: Props) {
  const [mode, setMode] = useState<'menu' | 'portion'>('menu');
  const [percent, setPercent] = useState('');

  const close = () => {
    setMode('menu');
    setPercent('');
    onClose();
  };

  const confirmPortion = () => {
    const pct = parseFloat(percent);
    if (!isNaN(pct) && pct > 0 && pct <= 100) {
      onClaimPortion(pct);
      close();
    }
  };

  const percentValid = !!percent && !isNaN(parseFloat(percent)) && parseFloat(percent) > 0 && parseFloat(percent) <= 100;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={close}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={close}>
        <TouchableOpacity activeOpacity={1} style={styles.content}>
          {mode === 'menu' ? (
            <>
              <Text style={styles.message}>Split item?</Text>
              <Button title="Split Equally" onPress={() => { close(); onSplitEqual(); }} style={styles.button} />
              <OutlineButton
                title="Claim Portion"
                onPress={() => setMode('portion')}
                style={styles.button}
              />
              <OutlineButton
                title="Cancel"
                onPress={close}
                style={styles.cancelButton}
                textColor={colors.pinkRed}
                borderColor={colors.pinkRed}
              />
            </>
          ) : (
            <>
              <Text style={styles.message}>Claim Percentage</Text>
              <TextInput
                placeholder="Percent (0-100)"
                value={percent}
                onChangeText={setPercent}
                keyboardType="numeric"
                style={styles.input}
              />
              <Button title="Confirm" onPress={confirmPortion} style={styles.button} disabled={!percentValid} />
              <OutlineButton
                title="Cancel"
                onPress={close}
                style={styles.cancelButton}
                textColor={colors.pinkRed}
                borderColor={colors.pinkRed}
              />
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    backgroundColor: colors.background,
    padding: spacing.l,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    alignItems: 'center',
  },
  message: {
    marginTop: spacing.s,
    marginBottom: spacing.l * 1.5,
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    alignSelf: 'stretch',
    marginTop: spacing.m,
  },
  cancelButton: {
    alignSelf: 'stretch',
    marginTop: spacing.m,
  },
  input: {
    alignSelf: 'stretch',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: spacing.m,
    marginTop: spacing.m,
  },
});
