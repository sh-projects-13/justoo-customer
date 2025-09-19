import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { cartAPI, addressesAPI, ordersAPI } from '../../services/api';

export default function CheckoutScreen() {
    const [cartSummary, setCartSummary] = useState(null);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [isLoading, setIsLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        loadCheckoutData();
    }, []);

    const loadCheckoutData = async () => {
        try {
            setIsLoading(true);
            const [cartResponse, addressesResponse] = await Promise.all([
                cartAPI.getCartSummary(),
                addressesAPI.getAddresses(),
            ]);

            if (cartResponse.data.success) {
                setCartSummary(cartResponse.data.data);
            }

            if (addressesResponse.data.success) {
                setAddresses(addressesResponse.data.data);
                // Auto-select default address
                const defaultAddress = addressesResponse.data.data.find(addr => addr.isDefault);
                if (defaultAddress) {
                    setSelectedAddress(defaultAddress);
                }
            }
        } catch (error) {
            console.error('Error loading checkout data:', error);
            Alert.alert('Error', 'Failed to load checkout data');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            Alert.alert('Error', 'Please select a delivery address');
            return;
        }

        try {
            setIsPlacingOrder(true);
            const response = await ordersAPI.createOrder({
                deliveryAddressId: selectedAddress.id,
                paymentMethod,
            });

            if (response.data.success) {
                Alert.alert(
                    'Order Placed!',
                    `Your order has been placed successfully. Order #${response.data.data.orderNumber}`,
                    [
                        {
                            text: 'View Order',
                            onPress: () => {
                                navigation.navigate('Orders');
                            },
                        },
                        {
                            text: 'Continue Shopping',
                            onPress: () => navigation.navigate('Home'),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', response.data.message);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Error', 'Failed to place order');
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const selectAddress = (address) => {
        setSelectedAddress(address);
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!cartSummary || cartSummary.items.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Your cart is empty</Text>
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
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Checkout</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Delivery Address */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="location" size={20} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                </View>

                {addresses.length === 0 ? (
                    <View style={styles.emptyAddress}>
                        <Text style={styles.emptyAddressText}>No addresses found</Text>
                        <TouchableOpacity style={styles.addAddressButton}>
                            <Text style={styles.addAddressText}>Add Address</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {addresses?.filter(address => address != null).map((address) => (
                            <TouchableOpacity
                                key={address?.id || Math.random()}
                                style={[
                                    styles.addressCard,
                                    selectedAddress?.id === address?.id && styles.addressCardSelected,
                                ]}
                                onPress={() => selectAddress(address)}
                            >
                                <Text style={styles.addressType}>
                                    {address?.type ? address.type.charAt(0).toUpperCase() + address.type.slice(1) : 'Address'}
                                    {address?.isDefault && ' (Default)'}
                                </Text>
                                <Text style={styles.addressText} numberOfLines={3}>
                                    {address?.fullAddress || 'Address not available'}
                                </Text>
                                {address?.landmark && (
                                    <Text style={styles.landmarkText}>{address.landmark}</Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="basket" size={20} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                </View>

                {cartSummary?.items?.filter(item => item != null).map((item) => (
                    <View key={item?.id || Math.random()} style={styles.orderItem}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName} numberOfLines={2}>
                                {item?.name || 'Unknown Item'}
                            </Text>
                            <Text style={styles.itemQuantity}>Qty: {item?.quantity || 0}</Text>
                        </View>
                        <Text style={styles.itemPrice}>₹{item?.totalPrice || 0}</Text>
                    </View>
                ))}
            </View>

            {/* Payment Method */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="card" size={20} color="#007AFF" />
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                </View>

                <TouchableOpacity
                    style={[
                        styles.paymentOption,
                        paymentMethod === 'cash' && styles.paymentOptionSelected,
                    ]}
                    onPress={() => setPaymentMethod('cash')}
                >
                    <Ionicons name="cash" size={20} color="#28a745" />
                    <Text style={styles.paymentText}>Cash on Delivery</Text>
                    {paymentMethod === 'cash' && (
                        <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.paymentOption,
                        paymentMethod === 'online' && styles.paymentOptionSelected,
                    ]}
                    onPress={() => setPaymentMethod('online')}
                >
                    <Ionicons name="card" size={20} color="#007AFF" />
                    <Text style={styles.paymentText}>Online Payment</Text>
                    {paymentMethod === 'online' && (
                        <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Order Total */}
            <View style={styles.totalSection}>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>₹{cartSummary.subtotal}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Delivery Fee</Text>
                    <Text style={styles.totalValue}>₹{cartSummary.deliveryFee}</Text>
                </View>
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tax</Text>
                    <Text style={styles.totalValue}>₹{cartSummary.taxAmount}</Text>
                </View>
                <View style={[styles.totalRow, styles.finalTotal]}>
                    <Text style={styles.finalTotalLabel}>Total</Text>
                    <Text style={styles.finalTotalValue}>₹{cartSummary.total}</Text>
                </View>
            </View>

            {/* Place Order Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.placeOrderButton,
                        (!selectedAddress || isPlacingOrder) && styles.buttonDisabled,
                    ]}
                    onPress={handlePlaceOrder}
                    disabled={!selectedAddress || isPlacingOrder}
                >
                    {isPlacingOrder ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={20} color="#fff" />
                            <Text style={styles.placeOrderText}>
                                Place Order • ₹{cartSummary.total}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 15,
        paddingTop: 50,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    section: {
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 10,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 10,
    },
    emptyAddress: {
        alignItems: 'center',
        padding: 20,
    },
    emptyAddressText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
    },
    addAddressButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addAddressText: {
        color: '#fff',
        fontWeight: '600',
    },
    addressCard: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginRight: 10,
        minWidth: 200,
    },
    addressCardSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f8ff',
    },
    addressType: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    addressText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    landmarkText: {
        fontSize: 12,
        color: '#999',
    },
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    itemQuantity: {
        fontSize: 12,
        color: '#666',
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 10,
    },
    paymentOptionSelected: {
        borderColor: '#007AFF',
        backgroundColor: '#f0f8ff',
    },
    paymentText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
        flex: 1,
    },
    totalSection: {
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 10,
        padding: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
    },
    totalValue: {
        fontSize: 14,
        color: '#333',
    },
    finalTotal: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        marginTop: 10,
    },
    finalTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    finalTotalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    buttonContainer: {
        padding: 15,
    },
    placeOrderButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    placeOrderText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});