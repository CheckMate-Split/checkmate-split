import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../components/PageHeader';
import Text from '../components/Text';
import { colors, spacing } from '../constants';

export default function FriendsScreen() {
  const [tab, setTab] = useState<'friends' | 'groups'>('friends');
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader title="Friends" noTopMargin />
      <View style={styles.tabs}>
        <TouchableOpacity
          onPress={() => setTab('friends')}
          style={[styles.tab, tab === 'friends' && styles.tabSelected]}
        >
          <Text style={[styles.tabText, tab === 'friends' && styles.tabTextSelected]}>Friends</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setTab('groups')}
          style={[styles.tab, tab === 'groups' && styles.tabSelected]}
        >
          <Text style={[styles.tabText, tab === 'groups' && styles.tabTextSelected]}>Groups</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.empty}>no friends yet</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.m,
  },
  empty: {
    marginTop: spacing.m,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.m,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.s,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabSelected: {
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: 18,
    color: '#666',
  },
  tabTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
