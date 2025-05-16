import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';

const BASE_URL = 'http://10.0.0.28:5050'; // your unified backend IP
const friends = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Jamie'];

type SplitPerson = {
  name: string;
  owesTo: string;
  amount: number;
  status: 'pending' | 'paid';
};

type Expense = {
  id: number;
  type: 'bill' | 'subscription';
  title: string;
  amount: number;
  paidBy: string;
  splitBetween: string[];
  splitDetails: SplitPerson[];
  createdAt: string;
};

export default function SharedExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [expenseInput, setExpenseInput] = useState({
    title: '',
    amount: '',
    paidBy: '',
    splitBetween: '',
    type: 'bill' as 'bill' | 'subscription',
  });

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/expenses`);
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      Alert.alert('Error', 'Could not fetch expenses from the server.');
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async () => {
    const { title, amount, paidBy, splitBetween, type } = expenseInput;
    const splitArray = splitBetween.split(',').map((name) => name.trim());

    try {
      const response = await fetch(`${BASE_URL}/api/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          amount,
          paidBy,
          splitBetween: splitArray,
          type,
        }),
      });

      const newExpense = await response.json();
      setExpenses((prev) => [...prev, newExpense]);
      setModalVisible(false);
      setExpenseInput({ title: '', amount: '', paidBy: '', splitBetween: '', type: 'bill' });
      Alert.alert('Success', 'Expense added successfully.');
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Failed to add expense.');
    }
  };

  const markAsPaid = async (expenseId: string, name: string) => {
    try {
      const response = await fetch(`${BASE_URL}/api/expenses/${expenseId}/pay/${name}`, {
        method: 'PATCH',
      });
      await response.json();
      Alert.alert('Success', `${name} marked as paid.`);
      fetchExpenses(); // refresh the list
    } catch (error) {
      console.error('Error updating payment status:', error);
      Alert.alert('Error', 'Failed to update payment status.');
    }
  };

  useEffect(() => {
    fetchExpenses();
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
      <Text style={styles.title}>Shared Expenses</Text>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>+ Add Expense</Text>
      </TouchableOpacity>

      <FlatList
        data={expenses.filter((e) => e.splitDetails.some((p) => p.status !== 'paid'))}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.billCard}>
            <Text style={styles.description}>
              {item.title} ({item.type === 'subscription' ? 'Recurring' : 'One-time'})
            </Text>
            <Text style={styles.subtext}>Paid by: {item.paidBy}</Text>
            <Text style={styles.amount}>Total: ${item.amount.toFixed(2)}</Text>
            <Text style={styles.subheader}>Split Details:</Text>
            {item.splitDetails
              .filter((person) => person.status !== 'paid')
              .map((person) => (
                <View key={`${item.id}-${person.name}`} style={styles.personRow}>
                  <Text>
                    {person.name} owes ${person.amount.toFixed(2)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => markAsPaid(item.id.toString(), person.name)}
                    style={styles.payButton}
                  >
                    <Text style={styles.payButtonText}>Mark Paid</Text>
                  </TouchableOpacity>
                </View>
              ))}
          </View>
        )}
      />

      {/* Modal to add expense */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.centered}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Add Expense</Text>

            {/* Toggle type */}
            <TouchableOpacity
              style={[styles.friendOption, expenseInput.type === 'subscription' && styles.friendSelected]}
              onPress={() =>
                setExpenseInput((prev) => ({
                  ...prev,
                  type: prev.type === 'subscription' ? 'bill' : 'subscription',
                }))
              }
            >
              <Text style={{ color: expenseInput.type === 'subscription' ? 'white' : '#374151' }}>
                Recurring? {expenseInput.type === 'subscription' ? '✓' : ''}
              </Text>
            </TouchableOpacity>

            {/* Title, amount, paidBy */}
            {['title', 'amount', 'paidBy'].map((field) => (
              <TextInput
                key={field}
                placeholder={field}
                style={styles.input}
                value={expenseInput[field as keyof typeof expenseInput]}
                onChangeText={(text) =>
                  setExpenseInput((prev) => ({ ...prev, [field]: text }))
                }
              />
            ))}

            <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Split Between:</Text>
            {friends.map((friend) => {
              const selected = expenseInput.splitBetween
                .split(',')
                .map((n) => n.trim())
                .includes(friend);

              return (
                <TouchableOpacity
                  key={friend}
                  style={[styles.friendOption, selected && styles.friendSelected]}
                  onPress={() => {
                    setExpenseInput((prev) => {
                      const names = prev.splitBetween
                        .split(',')
                        .map((n) => n.trim())
                        .filter((n) => n);
                      const updated = selected
                        ? names.filter((n) => n !== friend)
                        : [...names, friend];
                      return { ...prev, splitBetween: updated.join(',') };
                    });
                  }}
                >
                  <Text style={{ color: selected ? 'white' : '#374151' }}>{friend}</Text>
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity onPress={addExpense} style={styles.payButton}>
              <Text style={styles.payButtonText}>Submit</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: 'center', marginTop: 10, color: '#EF4444' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  payButtonText: {
    color: 'white',
    fontSize: 12,
  },
  addButton: {
    backgroundColor: '#22C55E',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
    width: '100%',
  },
  modalCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 5,
  },
  friendOption: {
    padding: 8,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  friendSelected: {
    backgroundColor: '#7D5FFF',
  },
  typeToggle: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
});
