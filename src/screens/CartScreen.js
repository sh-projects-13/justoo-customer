import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { cartAPI } from '../services/api';
import ItemImage from '../components/ItemImage';

export default function CartScreen() {
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        loadCart();
    }, []);

    // Refresh cart when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            loadCart();
        }, [])
    );

    const loadCart = async () => {
        try {
            setIsLoading(true);
            const response = await cartAPI.getCart();
            if (response.data.success) {
                setCart(response.data.data);
            } else {
                // If cart fetch fails, set empty cart
                setCart({ items: [], total: 0, itemCount: 0 });
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            // Set empty cart on error instead of showing alert repeatedly
            setCart({ items: [], total: 0, itemCount: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    const updateItemQuantity = async (itemId, newQuantity) => {
        try {
            const response = await cartAPI.updateCartItem(itemId, { quantity: newQuantity });
            console.log('Update item response:', response);
            if (response.data.success) {
                setCart(response.data.data);
            }
        } catch (error) {
            console.error('Error updating item:', error);
            Alert.alert('Error', 'Failed to update item');
        }
    };

    const removeItem = async (itemId) => {
        Alert.alert(
            'Remove Item',
            'Are you sure you want to remove this item from cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await cartAPI.removeFromCart(itemId);
                            if (response.data.success) {
                                setCart(response.data.data);
                            }
                        } catch (error) {
                            console.error('Error removing item:', error);
                            Alert.alert('Error', 'Failed to remove item');
                        }
                    },
                },
            ]
        );
    };

    const clearCart = async () => {
        Alert.alert(
            'Clear Cart',
            'Are you sure you want to clear all items from cart?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await cartAPI.clearCart();
                            if (response.data.success) {
                                setCart(response.data.data);
                            }
                        } catch (error) {
                            console.error('Error clearing cart:', error);
                            Alert.alert('Error', 'Failed to clear cart');
                        }
                    },
                },
            ]
        );
    };

    const handleCheckout = () => {
        if (!cart || !cart.items || cart.items.length === 0) {
            Alert.alert('Empty Cart', 'Add items to cart before checkout');
            return;
        }
        navigation.navigate('Checkout');
    };

    const renderCartItem = ({ item }) => {
        if (!item) {
            return null; // Skip rendering if item is undefined/null
        }

        return (
            <View style={styles.cartItem}>
                <ItemImage
                    item={item}
                    size={50}
                    style={styles.itemImage}
                />

                <View style={styles.itemDetails}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item?.name || 'Unknown Item'}
                    </Text>
                    <Text style={styles.itemPrice}>₹{item?.price || 0}</Text>
                    <Text style={styles.itemUnit}>{item?.unit || 'unit'}</Text>
                </View>

                <View style={styles.quantityControls}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateItemQuantity(item?.id, (item?.quantity || 1) - 1)}
                    >
                        <Ionicons name="remove" size={16} color="#007AFF" />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{item?.quantity || 0}</Text>

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateItemQuantity(item?.id, (item?.quantity || 1) + 1)}
                    >
                        <Ionicons name="add" size={16} color="#007AFF" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeItem(item?.id)}
                >
                    <Ionicons name="trash" size={20} color="#ff4444" />
                </TouchableOpacity>
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="basket-outline" size={80} color="#ccc" />
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <Text style={styles.emptySubtext}>Add some items to get started</Text>
                <TouchableOpacity
                    style={styles.shopButton}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.shopButtonText}>Start Shopping</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Cart Items */}
            <FlatList
                data={cart?.items?.filter(item => item != null) || []}
                renderItem={renderCartItem}
                keyExtractor={(item) => item?.id?.toString() || Math.random().toString()}
                contentContainerStyle={styles.cartList}
                showsVerticalScrollIndicator={false}
            />

            {/* Cart Summary */}
            <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Items ({cart?.itemCount || 0})</Text>
                    <Text style={styles.summaryValue}>₹{cart?.total || 0}</Text>
                </View>

                <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                    <Text style={styles.clearButtonText}>Clear Cart</Text>
                </TouchableOpacity>
            </View>

            {/* Checkout Button */}
            <View style={styles.checkoutContainer}>
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                    <Text style={styles.checkoutButtonText}>
                        Proceed to Checkout • ₹{cart.total}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    emptySubtext: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    shopButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
    },
    shopButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cartList: {
        padding: 15,
    },
    cartItem: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemImage: {
        marginRight: 15,
    },
    itemDetails: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 2,
    },
    itemUnit: {
        fontSize: 12,
        color: '#666',
    },
    quantityControls: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 10,
    },
    quantityButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 16,
        fontWeight: '600',
        marginHorizontal: 15,
        minWidth: 30,
        textAlign: 'center',
    },
    removeButton: {
        padding: 5,
    },
    summaryContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 16,
        color: '#333',
    },
    summaryValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    clearButton: {
        alignSelf: 'flex-end',
    },
    clearButtonText: {
        color: '#ff4444',
        fontSize: 14,
    },
    checkoutContainer: {
        backgroundColor: '#fff',
        padding: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    checkoutButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});