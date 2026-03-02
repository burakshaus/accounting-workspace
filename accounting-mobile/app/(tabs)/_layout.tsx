import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#1E3A5F',
      tabBarInactiveTintColor: '#aaa',
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingBottom: 6,
        paddingTop: 6,
        height: 60,
      },
      tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
    }}>
      <Tabs.Screen name="dashboard" options={{ title: 'Dashboard',
        tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="income" options={{ title: 'Income',
        tabBarIcon: ({ color, size }) => <Ionicons name="arrow-down-circle-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="expense" options={{ title: 'Expense',
        tabBarIcon: ({ color, size }) => <Ionicons name="arrow-up-circle-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports',
        tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} /> }} />
    </Tabs>
  );
}