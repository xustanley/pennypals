import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const recentActivity = [
  {
    id: '1',
    title: 'Apartment Rent',
    date: 'May 2',
    amount: '$750.00',
    note: 'Split with 3 people',
    icon: <Ionicons name="home-outline" size={24} color="#EF4444" />,
  },
  {
    id: '2',
    title: 'Groceries',
    date: 'May 1',
    amount: '$64.32',
    note: 'Split with Sam',
    icon: <MaterialIcons name="shopping-cart" size={24} color="#10B981" />,
  },
  {
    id: '3',
    title: 'Netflix',
    date: 'Apr 28',
    amount: '$14.99',
    note: 'Subscription',
    icon: <FontAwesome5 name="film" size={20} color="#6366F1" />,
  },
];

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hello, Alex!</Text>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceText}>Available Balance</Text>
        <Text style={styles.amount}>$1,248.32</Text>
        <Text style={styles.subtext}>+$245.20 this month</Text>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.button}>
          <Ionicons name="card-outline" size={24} color="#00B686" />
          <Text>Pay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Ionicons name="pie-chart-outline" size={24} color="#7D5FFF" />
          <Text>Split</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Ionicons name="swap-horizontal-outline" size={24} color="#007AFF" />
          <Text>Transfer</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <FlatList
        data={recentActivity}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>{item.icon}</View>
            <View style={styles.activityText}>
              <Text style={styles.activityTitle}>{item.title}</Text>
              <Text style={styles.activityNote}>{item.note} • {item.date}</Text>
            </View>
            <Text style={styles.activityAmount}>{item.amount}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: 'white' },
  greeting: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  balanceCard: {
    backgroundColor: '#7D5FFF',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  balanceText: { color: 'white', fontSize: 14 },
  amount: { color: 'white', fontSize: 32, fontWeight: 'bold' },
  subtext: { color: 'white', fontSize: 14 },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  button: { alignItems: 'center', gap: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  activityIcon: { marginRight: 12 },
  activityText: { flex: 1 },
  activityTitle: { fontSize: 16 },
  activityNote: { fontSize: 12, color: 'gray' },
  activityAmount: { fontSize: 16, fontWeight: '500' },
});
