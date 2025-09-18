import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { addressesAPI } from '../services/api';

export default function ProfileScreen() {
    const [addresses, setAddresses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user, logout } = useAuth();
    const navigation = useNavigation();

    useEffect(() => {
        loadAddresses();
    }, []);

    const loadAddresses = async () => {
        try {
            setIsLoading(true);
            const response = await addressesAPI.getAddresses();
            if (response.data.success) {
                setAddresses(response.data.data);
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: logout,
                },
            ]
        );
    };

    const menuItems = [
        {
            id: 'addresses',
            title: 'My Addresses',
            icon: 'location-outline',
            onPress: () => navigation.navigate('Addresses'),
            badge: addresses.length,
        },
        {
            id: 'orders',
            title: 'Order History',
            icon: 'receipt-outline',
            onPress: () => navigation.navigate('Orders'),
        },
        {
            id: 'favorites',
            title: 'Favorite Items',
            icon: 'heart-outline',
            onPress: () => Alert.alert('Coming Soon', 'This feature is coming soon!'),
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: 'settings-outline',
            onPress: () => Alert.alert('Coming Soon', 'This feature is coming soon!'),
        },
        {
            id: 'help',
            title: 'Help & Support',
            icon: 'help-circle-outline',
            onPress: () => Alert.alert('Coming Soon', 'This feature is coming soon!'),
        },
    ];

    const renderMenuItem = (item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
        >
            <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={24} color="#007AFF" />
                <Text style={styles.menuItemText}>{item.title}</Text>
            </View>
            <View style={styles.menuItemRight}>
                {item.badge !== undefined && item.badge > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                )}
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            {/* User Info */}
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </Text>
                </View>
                <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userPhone}>{user?.phone || ''}</Text>
                    {user?.email && <Text style={styles.userEmail}>{user.email}</Text>}
                </View>
                <TouchableOpacity style={styles.editButton}>
                    <Ionicons name="pencil" size={20} color="#007AFF" />
                </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <View style={styles.menuContainer}>
                {menuItems.map(renderMenuItem)}
            </View>

            {/* Logout Button */}
            <View style={styles.logoutContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Ionicons name="log-out-outline" size={20} color="#dc3545" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            {/* App Info */}
            <View style={styles.appInfo}>
                <Text style={styles.appVersion}>Justoo v1.0.0</Text>
                <Text style={styles.appDescription}>
                    10-minute delivery service
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    userInfo: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        marginBottom: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 2,
    },
    userPhone: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: '#666',
    },
    editButton: {
        padding: 8,
    },
    menuContainer: {
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
    menuItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: '#007AFF',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 10,
    },
    badgeText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    logoutContainer: {
        backgroundColor: '#fff',
        marginBottom: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    logoutText: {
        fontSize: 16,
        color: '#dc3545',
        marginLeft: 15,
        fontWeight: '600',
    },
    appInfo: {
        alignItems: 'center',
        padding: 20,
    },
    appVersion: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    appDescription: {
        fontSize: 12,
        color: '#666',
    },
});