import { Tabs } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarShowLabel: false, headerShown: false, tabBarStyle: { height: 70, borderTopLeftRadius: 20, borderTopRightRadius: 20 } }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <Ionicons name="home-outline" size={24} color={focused ? '#3B82F6' : '#9CA3AF'} />
          ),
        }}
      />
      <Tabs.Screen
        name="bills"
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="cash-multiple" size={24} color={focused ? '#3B82F6' : '#9CA3AF'} />
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons name="target" size={24} color={focused ? '#3B82F6' : '#9CA3AF'} />
          ),
        }}
      />
    </Tabs>
  );
}
