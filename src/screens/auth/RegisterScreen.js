import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { colors, spacing, typography, radius, shadow } from '../../theme';

export default function RegisterScreen() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigation = useNavigation();

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleRegister = async () => {
        const { name, phone, password } = formData;

        if (!name || !phone || !password) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (name.length < 2) {
            Alert.alert('Error', 'Name must be at least 2 characters long');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        try {
            const result = await register(formData);
            if (!result.success) {
                Alert.alert('Registration Failed', result.message);
            }
        } catch (error) {
            Alert.alert('Error', 'An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.hero}>
                    <Text style={styles.eyebrow}>JUSTOO</Text>
                    <Text style={styles.title}>Create your account</Text>
                    <Text style={styles.subtitle}>Unlock fast delivery and curated picks</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Full Name *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.name}
                        onChangeText={(value) => handleInputChange('name', value)}
                        placeholder="Enter your full name"
                        placeholderTextColor={colors.textMuted}
                        autoCapitalize="words"
                    />

                    <Text style={styles.label}>Phone Number *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(value) => handleInputChange('phone', value)}
                        placeholder="Enter your phone number"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="phone-pad"
                    />

                    <Text style={styles.label}>Email (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.email}
                        onChangeText={(value) => handleInputChange('email', value)}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Password *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.password}
                        onChangeText={(value) => handleInputChange('password', value)}
                        placeholder="Create a password"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.card} />
                        ) : (
                            <Text style={styles.buttonText}>Create account</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={styles.linkText}>
                            Already have an account? <Text style={styles.linkTextBold}>Login</Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.page,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.lg,
    },
    hero: {
        marginBottom: spacing.lg,
    },
    eyebrow: {
        color: colors.accent,
        fontWeight: '800',
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: typography.h1,
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.xs,
        lineHeight: 32,
    },
    subtitle: {
        fontSize: typography.body,
        color: colors.textMuted,
    },
    formCard: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        ...shadow.card,
    },
    label: {
        fontSize: typography.body,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: spacing.md,
        fontSize: typography.body,
        marginBottom: spacing.md,
        backgroundColor: colors.page,
        color: colors.text,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.sm,
        ...shadow.soft,
    },
    buttonDisabled: {
        backgroundColor: colors.border,
    },
    buttonText: {
        color: colors.card,
        fontSize: typography.body,
        fontWeight: '800',
    },
    linkButton: {
        alignItems: 'center',
        marginTop: spacing.md,
    },
    linkText: {
        fontSize: typography.body,
        color: colors.textMuted,
    },
    linkTextBold: {
        color: colors.primary,
        fontWeight: '800',
    },
});