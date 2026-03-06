import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { getToken } from '../../lib/api';

export default function TabsLayout() {
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await getToken();
      if (!token) {
        router.replace('/(auth)/login');
      } else {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

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
      <Tabs.Screen name="dashboard" options={{
        title: t('dashboard.title'),
        tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />
      }} />
      <Tabs.Screen name="income" options={{
        title: t('dashboard.income'),
        tabBarIcon: ({ color, size }) => <Ionicons name="arrow-down-circle-outline" size={size} color={color} />
      }} />
      <Tabs.Screen name="expense" options={{
        title: t('dashboard.expense'),
        tabBarIcon: ({ color, size }) => <Ionicons name="arrow-up-circle-outline" size={size} color={color} />
      }} />
      <Tabs.Screen name="reports" options={{
        title: t('dashboard.reports'),
        tabBarIcon: ({ color, size }) => <Ionicons name="bar-chart-outline" size={size} color={color} />
      }} />
      <Tabs.Screen name="settings" options={{
        title: t('settings.title'),
        tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />
      }} />
    </Tabs>
  );
}
