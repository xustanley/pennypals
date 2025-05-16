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

//your local IP
const BASE_URL = 'http://192.168.5.80:1010';
//friends list
const friends = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Jamie'];
const currentUser = 'Alex';

//person who is part of the goal's split details.
type SplitPerson = {
    name: string;
    owesTo: string;
    amount: number;
    contributed: number;
};

//represents a goal's details.
type Goal = {
    id: number;
    description: string;
    amount: number;
    createdBy: string;
    splitBetween: string[];
    splitDetails: SplitPerson[];
    createdAt: string;
};

export default function Goals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    
    const [loading, setLoading] = useState(true);

    const [contributionPrompt, setContributionPrompt] = useState<{
      visible: boolean;
      goalId: number | null;
      personName: string;
    }>({
      visible: false,
      goalId: null,
      personName: '',
    });

    const [contributionAmount, setContributionAmount] = useState('');
    
    // used for setting the goal description
    const [modalVisible, setModalVisible] = useState(false);
    const [goalDescription, setGoalDescription] = useState({
      description: '',
      amount: '',
      createdBy: '',
      splitBetween: '',
    });

    //get all of our bills
    const fetchGoals = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/goals`);
            const data = await response.json();
            setGoals(data);
        } catch (error) {
            console.error('Error fetching goals:', error);
            Alert.alert('Error', 'Could not fetch goals from the server.');
        } finally {
            setLoading(false);
        }
    };

    //patch request to contribute to a goal
    const contribute = async (goalId: string, name: string, amount: Number) => {
        try {
            const response = await fetch(`${BASE_URL}/api/goals/${goalId}/contribute/${name}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount }),
            });
            await response.json();
            Alert.alert('Success', `${name} contributed $${amount.toFixed(2)}`);
            fetchGoals();
        } catch (error) {
            console.error('Error contributing to goal:', error);
            Alert.alert('Error', 'Failed to contribute to goal.');
        }
    };

    const addGoal = async () => {
        const { description, amount, splitBetween } = goalDescription;
        const splitArray = splitBetween.split(',').map(name => name.trim());

        try {
            const response = await fetch(`${BASE_URL}/api/goals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description,
                    amount,
                    createdBy: currentUser,
                    splitBetween: splitArray,
                }),
            });

            const newGoal = await response.json();
            setGoals((prevGoals) => [...prevGoals, newGoal]);

            setModalVisible(false);
            setGoalDescription({
                description: '',
                amount: '',
                createdBy: '',
                splitBetween: ''
            });

            Alert.alert('Success', 'Goal added successfully.');
        } catch (error) {
            console.error('Error adding goal:', error);
            Alert.alert('Error', 'Failed to add goal.');
        }
      };


    useEffect(() => {
        fetchGoals();
    }, []);

    // If the data is still loading, show a loading indicator
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#7D5FFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Shared Goals</Text>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addButtonText}>+ Add New Shared Goal</Text>
            </TouchableOpacity>

            <FlatList
                data={goals}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }: {item : Goal}) => {
                    const totalContributed = item.splitDetails.reduce((sum, p) => sum + p.contributed, 0);
                    return (
                        <View style={styles.goalCard}>
                            <Text style={styles.description}>{item.description}</Text>
                            <Text style={styles.amount}>Goal: ${item.amount?.toFixed(2)}</Text>
                            <Text style={styles.amount}>Saved: ${totalContributed.toFixed(2)}</Text>
                            <Text style={styles.subtext}>Created by: {item.createdBy}</Text>
                            {item.splitDetails.map((person) => (
                              <View key={`${item.id}-${person.name}`} style={styles.personRow}>
                                <Text>
                                  {person.name} | Contributed: $
                                  {(person.contributed ?? 0).toFixed(2)} / $
                                  {(person.amount ?? 0).toFixed(2)}
                                </Text>
                                {person.name === currentUser && (
                                  <TouchableOpacity
                                    onPress={() =>
                                      setContributionPrompt({ visible: true, goalId: item.id, personName: person.name })
                                    }
                                    style={styles.contributeButton}
                                  >
                                    <Text style={styles.payButtonText}>Contribute</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            ))}
                        </View>
                    );
                }}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.centered}>
                    <View style={styles.modalCard}>
                        <Text style={styles.title}>Add New Goal</Text>

                        <TextInput
                          placeholder="Description"
                          style={styles.input}
                          value={goalDescription.description}
                          onChangeText={(text) =>
                            setGoalDescription((prev) => ({ ...prev, description: text }))
                          }
                        />

                        <TextInput
                          placeholder="Amount"
                          keyboardType="numeric"
                          style={styles.input}
                          value={goalDescription.amount}
                          onChangeText={(text) =>
                            setGoalDescription((prev) => ({ ...prev, amount: text }))
                          }
                        />

                        <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Split Between:</Text>
                        {friends.map((friend) => {
                            const selected = goalDescription.splitBetween
                                .split(',')
                                .map((n) => n.trim())
                                .includes(friend);

                            return (
                                <TouchableOpacity
                                    key={friend}
                                    style={[styles.friendOption, selected && styles.friendSelected]}
                                    onPress={() => {
                                        setGoalDescription((prev) => {
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

                        <TouchableOpacity onPress={addGoal} style={styles.payButton}>
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

            <Modal visible={contributionPrompt.visible} transparent animationType="slide">
              <View style={styles.centered}>
                <View style={styles.modalCard}>
                  <Text style={styles.title}>Enter Contribution</Text>
                  <TextInput
                    placeholder="Amount"
                    keyboardType="numeric"
                    style={styles.input}
                    value={contributionAmount}
                    onChangeText={setContributionAmount}
                  />
                  <TouchableOpacity
                    style={styles.payButton}
                    onPress={() => {
                      const value = parseFloat(contributionAmount || '0');
                      if (!value || value <= 0) {
                        Alert.alert('Invalid', 'Please enter a valid amount.');
                        return;
                      }
                      if (contributionPrompt.goalId && contributionPrompt.personName) {
                        contribute(
                          contributionPrompt.goalId.toString(),
                          contributionPrompt.personName,
                          value
                        );
                      }
                      setContributionPrompt({ visible: false, goalId: null, personName: '' });
                      setContributionAmount('');
                    }}
                  >
                    <Text style={styles.payButtonText}>Confirm</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setContributionPrompt({ visible: false, goalId: null, personName: '' });
                      setContributionAmount('');
                    }}
                  >
                    <Text style={{ textAlign: 'center', marginTop: 10, color: '#EF4444' }}>Cancel</Text>
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
    goalCard: {
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
    amount: { fontSize: 16, fontWeight: 'bold', marginTop: 4 },
    subheader: { fontSize: 14, fontWeight: '600', marginTop: 12, marginBottom: 4 },
    personRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    contributeButton: {
        backgroundColor: '#10B981',
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
    payButton: {
        backgroundColor: '#7D5FFF',
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
});

