import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExpenseScreen() {   // ExpenseScreen / ReportsScreen
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Income</Text>  {/* Expense / Reports */}
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No records yet.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  content: { flex: 1, padding: 20 },
  heading: { fontSize: 26, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 20 },
  emptyBox: { backgroundColor: '#fff', borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  emptyText: { color: '#aaa', fontSize: 14 },
});