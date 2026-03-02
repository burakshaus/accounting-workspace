import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const quickActions = [
  { label: 'Income', icon: 'arrow-down-circle-outline' as const, color: '#27ae60', route: '/(tabs)/income' },
  { label: 'Expense', icon: 'arrow-up-circle-outline' as const, color: '#e74c3c', route: '/(tabs)/expense' },
  { label: 'Reports', icon: 'bar-chart-outline' as const, color: '#2E75B6', route: '/(tabs)/reports' },
];

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Dashboard</Text>

        {/* Summary Cards */}
        <View style={styles.cardRow}>
          <View style={[styles.card, { backgroundColor: '#1E3A5F' }]}>
            <Text style={styles.cardLabel}>Total Income</Text>
            <Text style={styles.cardValue}>$0.00</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#e74c3c' }]}>
            <Text style={styles.cardLabel}>Total Expense</Text>
            <Text style={styles.cardValue}>$0.00</Text>
          </View>
        </View>
        <View style={styles.cardRow}>
          <View style={[styles.card, { backgroundColor: '#27ae60' }]}>
            <Text style={styles.cardLabel}>Net Balance</Text>
            <Text style={styles.cardValue}>$0.00</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#2E75B6' }]}>
            <Text style={styles.cardLabel}>Invoices</Text>
            <Text style={styles.cardValue}>0</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.label}
              style={styles.actionBtn}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={26} color="#fff" />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No transactions yet.</Text>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => router.replace('/(auth)/login')}
        >
          <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 26, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 20 },
  cardRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  card: { flex: 1, borderRadius: 14, padding: 18, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  cardValue: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E3A5F', marginTop: 24, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 18, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  actionIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  actionLabel: { fontSize: 13, fontWeight: '700', color: '#333' },
  emptyBox: { backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  emptyText: { color: '#aaa', fontSize: 14 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e74c3c' },
  logoutText: { color: '#e74c3c', fontSize: 15, fontWeight: '700' },
});