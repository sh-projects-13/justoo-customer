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

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigation = useNavigation();

    const handleLogin = async () => {
        if (!phone || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            const result = await login(phone, password);
            console.log(result);
            if (!result.success) {
                Alert.alert('Login Failed', result.message);
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
                    <Text style={styles.title}>Login to speed-run groceries</Text>
                    <Text style={styles.subtitle}>10-minute delivery • curated deals</Text>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter your phone number"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                    />

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Enter your password"
                        placeholderTextColor={colors.textMuted}
                        secureTextEntry
                        autoCapitalize="none"
                    />

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.card} />
                        ) : (
                            <Text style={styles.buttonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.linkText}>
                            Don't have an account? <Text style={styles.linkTextBold}>Register</Text>
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