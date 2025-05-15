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
const BASE_URL = 'http://10.0.0.28:1010';

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
    const contribute = async (goalId: string, name: string, amount = 5.0) => {
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
            <FlatList
                data={goals}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                    const totalContributed = item.splitDetails.reduce((sum, p) => sum + p.contributed, 0);
                    return (
                        <View style={styles.goalCard}>
                            <Text style={styles.description}>{item.description}</Text>
                            <Text style={styles.subtext}>Created by: {item.createdBy}</Text>
                            <Text style={styles.amount}>Goal: ${item.amount?.toFixed(2)}</Text>
                            <Text style={styles.amount}>Saved: ${totalContributed.toFixed(2)}</Text>
                            <Text style={styles.subheader}>Contributors:</Text>
                            {item.splitDetails.map((person) => (
                                <View key={`${item.id}-${person.name}`} style={styles.personRow}>
                                    <Text>
                                        {person.name} | Contributed: ${person.contributed.toFixed(2)} / $
                                        {person.amount.toFixed(2)}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => contribute(item.id.toString(), person.name)}
                                        style={styles.contributeButton}
                                    >
                                        <Text style={styles.payButtonText}>+ $5</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    );
                }}
            />
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
});
