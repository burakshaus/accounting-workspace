import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// Gerçek cihaz için bilgisayarınızın local IP'si (Expo'nun gösterdiği IP ile aynı olmalı)
export const API_URL = 'https://isocyano-karrie-shudderingly.ngrok-free.dev';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    },
});

// Her istekte token'ı otomatik ekle
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// If server returns 401, token is expired — log out
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error?.response?.status === 401) {
            await removeToken();
            router.replace('/(auth)/login');
        }
        return Promise.reject(error);
    }
);

export const saveToken = (token: string) => AsyncStorage.setItem('token', token);
export const getToken = () => AsyncStorage.getItem('token');
export const removeToken = () => AsyncStorage.removeItem('token');
