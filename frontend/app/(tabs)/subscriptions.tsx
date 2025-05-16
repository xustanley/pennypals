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

const BASE_URL = 'http://10.0.0.28:9090'; // Replace with your local IP
const friends = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Jamie'];

type SplitPerson = {
    name: string;
    owesTo: string;
    amount: number;
    status: 'pending' | 'paid';
};

type Subscription = {
    id: number;
    serviceName: string;
    monthlyCost: number;
    subscribedBy: string;
    splitBetween: string[];
    splitDetails: SplitPerson[];
    createdAt: string;
};

export default function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [subscriptionInput, setSubscriptionInput] = useState({
        serviceName: '',
        monthlyCost: '',
        subscribedBy: '',
        splitBetween: '',
    });

    const fetchSubscriptions = async () => {
        try {
            const response = await fetch(`${BASE_URL}/api/subscriptions`);
            const data = await response.json();
            setSubscriptions(data);
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
            Alert.alert('Error', 'Could not fetch subscriptions from the server.');
        } finally {
            setLoading(false);
        }
    };

    const addSubscription = async () => {
        const { serviceName, monthlyCost, subscribedBy, splitBetween } = subscriptionInput;
        const splitArray = splitBetween.split(',').map((name) => name.trim());

        try {
            const response = await fetch(`${BASE_URL}/api/subscriptions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceName,
                    monthlyCost,
                    subscribedBy,
                    splitBetween: splitArray,
                }),
            });

            const newSub = await response.json();
            setSubscriptions((prev) => [...prev, newSub]);
            setModalVisible(false);
            setSubscriptionInput({
                serviceName: '',
                monthlyCost: '',
                subscribedBy: '',
                splitBetween: '',
            });
            Alert.alert('Success', 'Subscription added.');
        } catch (error) {
            console.error('Error adding subscription:', error);
            Alert.alert('Error', 'Failed to add subscription.');
        }
    };

    const markAsPaid = async (subId: string, name: string) => {
        try {
            const response = await fetch(`${BASE_URL}/api/subscriptions/${subId}/pay/${name}`, {
                method: 'PATCH',
            });
            await response.json();
            Alert.alert('Success', `${name} marked as paid.`);
            fetchSubscriptions();
        } catch (error) {
            console.error('Error updating payment status:', error);
            Alert.alert('Error', 'Failed to update payment status.');
        }
    };

    useEffect(() => {
        fetchSubscriptions();
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
            <Text style={styles.title}>Shared Subscriptions</Text>

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addButtonText}>+ Add New Subscription</Text>
            </TouchableOpacity>

            <FlatList
                data={subscriptions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }: { item: Subscription }) => (
                    <View style={styles.card}>
                        <Text style={styles.description}>{item.serviceName}</Text>
                        <Text style={styles.subtext}>Subscribed by: {item.subscribedBy}</Text>
                        <Text style={styles.amount}>Monthly: ${item.monthlyCost.toFixed(2)}</Text>
                        <Text style={styles.subheader}>Split Details:</Text>
                        {(item.splitDetails || []).map((person) => (
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

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.centered}>
                    <View style={styles.modalCard}>
                        <Text style={styles.title}>Add Subscription</Text>

                        {['serviceName', 'monthlyCost', 'subscribedBy'].map((field) => (
                            <TextInput
                                key={field}
                                placeholder={field}
                                style={styles.input}
                                value={subscriptionInput[field as keyof typeof subscriptionInput]}
                                onChangeText={(text) =>
                                    setSubscriptionInput((prev) => ({ ...prev, [field]: text }))
                                }
                            />
                        ))}

                        <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Split Between:</Text>
                        {friends.map((friend) => {
                            const selected = subscriptionInput.splitBetween
                                .split(',')
                                .map((n) => n.trim())
                                .includes(friend);

                            return (
                                <TouchableOpacity
                                    key={friend}
                                    style={[
                                        styles.friendOption,
                                        selected && styles.friendSelected
                                    ]}
                                    onPress={() => {
                                        setSubscriptionInput((prev) => {
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

                        <TouchableOpacity onPress={addSubscription} style={styles.payButton}>
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
    card: {
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
});