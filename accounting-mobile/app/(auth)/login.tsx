import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { api, saveToken } from '../../lib/api';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/api/auth/login', { email, password });
      await saveToken(response.data.token);
      router.replace('/(tabs)/dashboard');
    } catch (e: any) {
      if (e?.response) {
        // Sunucudan hata döndü
        setError(e.response.data?.message || `Hata ${e.response.status}: ${e.response.statusText}`);
      } else if (e?.request) {
        // İstek atıldı ama yanıt gelmedi (ağ/IP sorunu)
        setError('Sunucuya ulaşılamıyor. Backend çalışıyor mu? IP doğru mu?');
      } else {
        setError(e?.message || 'Beklenmeyen bir hata oluştu.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>Accounting App</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>
        <View style={styles.form}>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign In</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.footerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  header: { marginBottom: 40, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1E3A5F' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 6 },
  form: {
    backgroundColor: '#fff', borderRadius: 16, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
  },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: '#f0f4f8', borderRadius: 10, padding: 14, fontSize: 15, color: '#222' },
  button: { backgroundColor: '#1E3A5F', borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 24 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  errorText: { color: '#e74c3c', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { fontSize: 14, color: '#666' },
  footerLink: { fontSize: 14, color: '#1E3A5F', fontWeight: '700' },
});