import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Goals() {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name="target" size={40} color="#3B82F6" />
      <Text style={styles.text}>Goals Page</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8FAFC' },
  text: { fontSize: 20, marginTop: 10, color: '#1F2937' },
});
