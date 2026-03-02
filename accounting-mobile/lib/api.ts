import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Gerçek cihaz için bilgisayarınızın local IP'si (Expo'nun gösterdiği IP ile aynı olmalı)
export const API_URL = 'http://192.168.0.17:5064';

export const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Her istekte token'ı otomatik ekle
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const saveToken = (token: string) => AsyncStorage.setItem('token', token);
export const getToken = () => AsyncStorage.getItem('token');
export const removeToken = () => AsyncStorage.removeItem('token');
