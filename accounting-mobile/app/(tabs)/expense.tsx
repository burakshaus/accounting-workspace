import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../lib/api';
import { useTranslation } from 'react-i18next';

type Expense = {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
};

export default function ExpenseScreen() {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const CATEGORIES = [
    t('categories.food'),
    t('categories.transport'),
    t('categories.rent'),
    t('categories.utilities'),
    t('categories.entertainment'),
    t('categories.other')
  ];

  const emptyForm = { amount: '', description: '', category: t('categories.other'), date: '' };

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await api.get('/api/expense');
      setExpenses(res.data);
    } catch {
      Alert.alert(t('common.errorTitle'), t('common.errorFetch'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0], category: t('categories.other') });
    setError('');
    setModalVisible(true);
  };

  const openEdit = (item: Expense) => {
    setEditingId(item.id);
    setForm({
      amount: String(item.amount),
      description: item.description,
      category: item.category,
      date: item.date.split('T')[0],
    });
    setError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.amount || !form.description || !form.date) {
      setError('Please fill in all fields.');
      return;
    }
    const amount = parseFloat(form.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        amount,
        description: form.description,
        category: form.category,
        date: new Date(form.date).toISOString(),
      };
      if (editingId !== null) {
        await api.put(`/api/expense/${editingId}`, payload);
      } else {
        await api.post('/api/expense', payload);
      }
      setModalVisible(false);
      fetchExpenses();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(t('expense.confirmDeleteTitle'), t('expense.confirmDeleteText'), [
      { text: t('expense.cancel'), style: 'cancel' },
      {
        text: t('expense.delete'), style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/api/expense/${id}`);
            fetchExpenses();
          } catch {
            Alert.alert(t('common.errorTitle'), t('common.errorFetch'));
          }
        },
      },
    ]);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>{t('expense.title')}</Text>
          <Text style={styles.total}>{t('expense.total')}: ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>{t('expense.addBtn')}</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1E3A5F" />
      ) : expenses.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>{t('expense.noRecords')}</Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={openAdd}>
            <Text style={styles.emptyAddBtnText}>{t('expense.addFirst')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardAmount}>${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
                <View style={styles.row}>
                  <Text style={styles.cardCategory}>{item.category}</Text>
                  <Text style={styles.cardDate}>{formatDate(item.date)}</Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                  <Text style={styles.editBtnText}>{t('expense.edit')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteBtnText}>{t('expense.delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editingId !== null ? t('expense.editTitle') : t('expense.newTitle')}</Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Text style={styles.label}>{t('expense.amountLabel')}</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={form.amount}
                onChangeText={(v) => setForm({ ...form, amount: v })}
              />

              <Text style={styles.label}>{t('expense.descLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder="..."
                value={form.description}
                onChangeText={(v) => setForm({ ...form, description: v })}
              />

              <Text style={styles.label}>{t('expense.catLabel')}</Text>
              <View style={styles.categoryRow}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.catChip, form.category === cat && styles.catChipActive]}
                    onPress={() => setForm({ ...form, category: cat })}
                  >
                    <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>{t('expense.dateLabel')}</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-01-15"
                value={form.date}
                onChangeText={(v) => setForm({ ...form, date: v })}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>{t('expense.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{t('expense.save')}</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingBottom: 12 },
  heading: { fontSize: 26, fontWeight: 'bold', color: '#1E3A5F' },
  total: { fontSize: 14, color: '#e74c3c', fontWeight: '600', marginTop: 2 },
  addBtn: { backgroundColor: '#1E3A5F', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { color: '#aaa', fontSize: 15, marginBottom: 16 },
  emptyAddBtn: { backgroundColor: '#1E3A5F', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  emptyAddBtnText: { color: '#fff', fontWeight: '700' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, marginHorizontal: 16, marginBottom: 10,
    padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardLeft: { flex: 1 },
  // Amount is red for expenses
  cardAmount: { fontSize: 18, fontWeight: 'bold', color: '#e74c3c' },
  cardDesc: { fontSize: 14, color: '#333', marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, marginTop: 4 },
  cardCategory: { fontSize: 12, color: '#1E3A5F', backgroundColor: '#e8f0fe', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  cardDate: { fontSize: 12, color: '#999' },
  cardActions: { gap: 6 },
  editBtn: { backgroundColor: '#f0f4ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  editBtnText: { color: '#1E3A5F', fontWeight: '600', fontSize: 12 },
  deleteBtn: { backgroundColor: '#fff0f0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  deleteBtnText: { color: '#e74c3c', fontWeight: '600', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalBox: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#f0f4f8', borderRadius: 10, padding: 13, fontSize: 15, color: '#222' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#f0f4f8' },
  catChipActive: { backgroundColor: '#1E3A5F' },
  catChipText: { fontSize: 13, color: '#555' },
  catChipTextActive: { color: '#fff', fontWeight: '600' },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelBtn: { flex: 1, backgroundColor: '#f0f4f8', borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#555', fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: '#1E3A5F', borderRadius: 10, padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  errorText: { color: '#e74c3c', fontSize: 13, marginBottom: 8, textAlign: 'center' },
});