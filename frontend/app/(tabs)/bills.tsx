import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

//your local IP
const BASE_URL = 'http://10.0.0.28:5050';

type SplitPerson = {
  name: string;
  owesTo: string;
  amount: number;
  status: 'pending' | 'paid';
};

type Bill = {
  id: number;
  description: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  splitDetails: SplitPerson[];
  createdAt: string; 
};

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  //get all bills
  const fetchBills = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/bills`);
      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      Alert.alert('Error', 'Could not fetch bills from the server.');
    } finally {
      setLoading(false);
    }
  };

  //patch request to mark a bill as paid
  const markAsPaid = async (billId: string, name: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/bills/${billId}/pay/${name}`, {
        method: 'PATCH',
      });
      await response.json();
      Alert.alert('Success', `${name} marked as paid.`);
      fetchBills(); // refresh the list
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to update payment status.');
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7D5FFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Split Bills</Text>
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }: {item: Bill}) => (
          <View style={styles.billCard}>
            <Text style={styles.description}>{item.description}</Text>
            <Text style={styles.subtext}>Paid by: {item.paidBy}</Text>
            <Text style={styles.amount}>Total: ${item.amount?.toFixed(2)}</Text>
            <Text style={styles.subheader}>Split Details:</Text>
            {(item.splitDetails || []).map((person: SplitPerson) => (
              <View key={`${item.id}-${person.name}`} style={styles.personRow}>
                <Text>{person.name} owes ${person.amount.toFixed(2)}</Text>
                <TouchableOpacity
                  onPress={() => markAsPaid(item.id.toString(), person.name)}
                  disabled={person.status === 'paid'}
                  style={[
                    styles.payButton,
                    person.status === 'paid' && styles.paidButton,
                  ]}
                >
                  <Text style={styles.payButtonText}>
                    {person.status === 'paid' ? 'Paid' : 'Mark Paid'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F8FAFC' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: '#1F2937' },
  billCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  description: { fontSize: 18, fontWeight: '600' },
  subtext: { fontSize: 14, color: '#6B7280' },
  amount: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  subheader: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  payButton: {
    backgroundColor: '#7D5FFF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  paidButton: {
    backgroundColor: '#D1D5DB',
  },
  payButtonText: {
    color: 'white',
    fontSize: 12,
  },
});
