import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api, removeToken } from '../../lib/api';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
};

type Transaction = {
  id: string; // "i-1" or "e-2"
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
};

export default function DashboardScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const quickActions = [
    { label: t('dashboard.income'), icon: 'arrow-down-circle-outline' as const, color: '#27ae60', route: '/(tabs)/income' },
    { label: t('dashboard.expense'), icon: 'arrow-up-circle-outline' as const, color: '#e74c3c', route: '/(tabs)/expense' },
    { label: t('dashboard.reports'), icon: 'bar-chart-outline' as const, color: '#2E75B6', route: '/(tabs)/reports' },
  ];
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch summary
      const summaryRes = await api.get('/api/reports/summary');
      setSummary(summaryRes.data);

      // Fetch recent 5 incomes and 5 expenses, merge & sort for a unified "Recent Transactions" view
      const [incomeRes, expenseRes] = await Promise.all([
        api.get('/api/income'),
        api.get('/api/expense')
      ]);

      const incomes = incomeRes.data.map((i: any) => ({ ...i, id: `i-${i.id}`, type: 'income' }));
      const expenses = expenseRes.data.map((e: any) => ({ ...e, id: `e-${e.id}`, type: 'expense' }));

      const all = [...incomes, ...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecentTransactions(all.slice(0, 5)); // Keep only 5 most recent
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleLogout = async () => {
    await removeToken();
    router.replace('/(auth)/login');
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{t('dashboard.title')}</Text>

        {/* Summary Cards */}
        {loading && !summary ? (
          <ActivityIndicator size="large" color="#1E3A5F" style={{ marginVertical: 20 }} />
        ) : (
          <>
            <View style={styles.cardRow}>
              <View style={[styles.card, { backgroundColor: '#1E3A5F' }]}>
                <Text style={styles.cardLabel}>{t('dashboard.totalIncome')}</Text>
                <Text style={styles.cardValue}>${summary?.totalIncome?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</Text>
              </View>
              <View style={[styles.card, { backgroundColor: '#e74c3c' }]}>
                <Text style={styles.cardLabel}>{t('dashboard.totalExpense')}</Text>
                <Text style={styles.cardValue}>${summary?.totalExpense?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</Text>
              </View>
            </View>
            <View style={styles.cardRow}>
              <View style={[styles.card, { backgroundColor: '#27ae60' }]}>
                <Text style={styles.cardLabel}>{t('dashboard.netBalance')}</Text>
                <Text style={styles.cardValue}>${summary?.netBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || '0.00'}</Text>
              </View>
              <View style={[styles.card, { backgroundColor: '#2E75B6' }]}>
                <Text style={styles.cardLabel}>{t('dashboard.totalTransactions')}</Text>
                <Text style={styles.cardValue}>{(summary?.incomeCount || 0) + (summary?.expenseCount || 0)}</Text>
              </View>
            </View>
          </>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
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
        <Text style={styles.sectionTitle}>{t('dashboard.recentTransactions')}</Text>
        {loading && recentTransactions.length === 0 ? (
          <ActivityIndicator size="small" color="#1E3A5F" style={{ marginTop: 20 }} />
        ) : recentTransactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t('dashboard.noTransactions')}</Text>
          </View>
        ) : (
          <View style={styles.recentList}>
            {recentTransactions.map((tx) => (
              <View key={tx.id} style={styles.txCard}>
                <View style={styles.txLeft}>
                  <Text style={styles.txDesc}>{tx.description}</Text>
                  <Text style={styles.txDate}>{formatDate(tx.date)}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === 'income' ? '#27ae60' : '#e74c3c' }]}>
                  {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#e74c3c" />
          <Text style={styles.logoutText}>{t('dashboard.logout')}</Text>
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
  recentList: { backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  txCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f4f8' },
  txLeft: { flex: 1 },
  txDesc: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 2 },
  txDate: { fontSize: 12, color: '#999' },
  txAmount: { fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#e74c3c' },
  logoutText: { color: '#e74c3c', fontSize: 15, fontWeight: '700' },
});