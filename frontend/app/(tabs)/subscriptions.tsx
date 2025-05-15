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


const BASE_URL = 'http://10.0.0.28:9090'; // Replace with your local IP


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
});
