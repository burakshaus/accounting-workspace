import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
    const { t, i18n } = useTranslation();

    const changeLanguage = async (lng: string) => {
        await i18n.changeLanguage(lng);
        await AsyncStorage.setItem('user-language', lng);
        Alert.alert(t('settings.saved'));
    };

    const currentLanguage = i18n.language;

    const languages = [
        { code: 'en', label: 'English' },
        { code: 'tr', label: 'Türkçe' },
        { code: 'de', label: 'Deutsch' }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.heading}>{t('settings.title')}</Text>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
                <Text style={styles.sectionDesc}>{t('settings.selectLanguage')}</Text>

                <View style={styles.langList}>
                    {languages.map((lang) => {
                        const isActive = currentLanguage === lang.code;
                        return (
                            <TouchableOpacity
                                key={lang.code}
                                style={[styles.langBtn, isActive && styles.langBtnActive]}
                                onPress={() => changeLanguage(lang.code)}
                            >
                                <Text style={[styles.langBtnText, isActive && styles.langBtnTextActive]}>
                                    {lang.label}
                                </Text>
                                {isActive && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fa', padding: 20 },
    heading: { fontSize: 26, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 24, paddingHorizontal: 10 },
    section: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    sectionDesc: { fontSize: 14, color: '#666', marginTop: 4, marginBottom: 16 },
    langList: { gap: 12 },
    langBtn: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f0f4f8',
        padding: 16,
        borderRadius: 12,
    },
    langBtnActive: { backgroundColor: '#1E3A5F' },
    langBtnText: { fontSize: 16, color: '#333', fontWeight: '500' },
    langBtnTextActive: { color: '#fff', fontWeight: '700' },
});
