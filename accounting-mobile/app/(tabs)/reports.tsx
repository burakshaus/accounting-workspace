import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../lib/api';
import { useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

type DashboardSummary = {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  incomeCount: number;
  expenseCount: number;
};

export default function ReportsScreen() {
  const { t } = useTranslation();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/reports/summary');
      setSummary(res.data);
    } catch (error) {
      console.log('Error fetching reports summary:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{t('reports.title')}</Text>

        {loading && !summary ? (
          <ActivityIndicator size="large" color="#1E3A5F" style={{ marginTop: 40 }} />
        ) : !summary ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>{t('reports.noData')}</Text>
          </View>
        ) : (
          <View style={styles.reportContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('reports.totalIncome')}</Text>
              <Text style={[styles.statValue, { color: '#27ae60' }]}>
                ${summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('reports.totalExpense')}</Text>
              <Text style={[styles.statValue, { color: '#e74c3c' }]}>
                ${summary.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('reports.netBalance')}</Text>
              <Text style={[styles.statValue, { color: summary.netBalance >= 0 ? '#1E3A5F' : '#e74c3c', fontSize: 22, fontWeight: '800' }]}>
                ${summary.netBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('reports.incomeNum')}</Text>
              <Text style={styles.statValueBase}>{summary.incomeCount}</Text>
            </View>

            <View style={styles.statRow}>
              <Text style={styles.statLabel}>{t('reports.expenseNum')}</Text>
              <Text style={styles.statValueBase}>{summary.expenseCount}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { padding: 20 },
  heading: { fontSize: 26, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 20 },
  emptyBox: { backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  emptyText: { color: '#aaa', fontSize: 14 },
  reportContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statLabel: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  statValueBase: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E3A5F',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f4f8',
    marginVertical: 8,
  }
});