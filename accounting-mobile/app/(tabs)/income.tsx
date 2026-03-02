import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { api } from '../../lib/api';

type Income = {
  id: number;
  amount: number;
  description: string;
  category: string;
  date: string;
  createdAt: string;
};

const CATEGORIES = ['Salary', 'Freelance', 'Rent', 'Investment', 'Other'];

const emptyForm = { amount: '', description: '', category: 'Diğer', date: '' };

export default function IncomeScreen() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchIncomes = useCallback(async () => {
    try {
      const res = await api.get('/api/income');
      setIncomes(res.data);
    } catch {
      Alert.alert('Error', 'Failed to load incomes.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIncomes(); }, [fetchIncomes]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm, date: new Date().toISOString().split('T')[0], category: 'Other' });
    setError('');
    setModalVisible(true);
  };

  const openEdit = (item: Income) => {
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
        await api.put(`/api/income/${editingId}`, payload);
      } else {
        await api.post('/api/income', payload);
      }
      setModalVisible(false);
      fetchIncomes();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete', 'Are you sure you want to delete this income?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sil', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/api/income/${id}`);
            fetchIncomes();
          } catch {
            Alert.alert('Error', 'Could not delete income.');
          }
        },
      },
    ]);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR');
  const total = incomes.reduce((sum, i) => sum + i.amount, 0);

  return (
    <SafeAreaView style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Income</Text>
          <Text style={styles.total}>Total: ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Liste */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#1E3A5F" />
      ) : incomes.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No income records yet.</Text>
          <TouchableOpacity style={styles.emptyAddBtn} onPress={openAdd}>
            <Text style={styles.emptyAddBtnText}>Add first income</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={incomes}
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
                  <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Ekle / Düzenle Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.modalTitle}>{editingId !== null ? 'Edit Income' : 'New Income'}</Text>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Text style={styles.label}>Amount ($)</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="0.00"
                value={form.amount}
                onChangeText={(v) => setForm({ ...form, amount: v })}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter description"
                value={form.description}
                onChangeText={(v) => setForm({ ...form, description: v })}
              />

              <Text style={styles.label}>Category</Text>
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

              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2024-01-15"
                value={form.date}
                onChangeText={(v) => setForm({ ...form, date: v })}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save</Text>}
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
  total: { fontSize: 14, color: '#27ae60', fontWeight: '600', marginTop: 2 },
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
  cardAmount: { fontSize: 18, fontWeight: 'bold', color: '#27ae60' },
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