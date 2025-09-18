import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ordersAPI } from '../services/api';

export default function OrderDetailScreen() {
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigation = useNavigation();
    const route = useRoute();
    const { orderId } = route.params;

    useEffect(() => {
        loadOrderDetails();
    }, [orderId]);

    const loadOrderDetails = async () => {
        try {
            setIsLoading(true);
            const response = await ordersAPI.getOrderById(orderId);
            if (response.data.success) {
                setOrder(response.data.data);
            } else {
                Alert.alert('Error', response.data.message);
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            Alert.alert('Error', 'Failed to load order details');
            navigation.goBack();
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await ordersAPI.cancelOrder(orderId);
                            if (response.data.success) {
                                Alert.alert('Success', 'Order cancelled successfully');
                                // Refresh order details
                                loadOrderDetails();
                            } else {
                                Alert.alert('Error', response.data.message);
                            }
                        } catch (error) {
                            console.error('Error cancelling order:', error);
                            Alert.alert('Error', 'Failed to cancel order');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'placed':
                return '#ffa500';
            case 'confirmed':
                return '#007AFF';
            case 'preparing':
                return '#28a745';
            case 'out_for_delivery':
                return '#17a2b8';
            case 'delivered':
                return '#28a745';
            case 'cancelled':
                return '#dc3545';
            default:
                return '#6c757d';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Order not found</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const canCancel = ['placed', 'confirmed'].includes(order.status);

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
                <Text style={styles.headerTitle}>Order Details</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Order Status */}
            <View style={styles.statusSection}>
                <View style={styles.orderNumberContainer}>
                    <Text style={styles.orderNumber}>Order #{order.id}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: getStatusColor(order.status) },
                        ]}
                    >
                        <Text style={styles.statusText}>
                            {order.status.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Order Items */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                {order.items.map((item) => (
                    <View key={item.id} style={styles.orderItem}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.itemName}</Text>
                            <Text style={styles.itemQuantity}>
                                Quantity: {item.quantity} × ₹{item.unitPrice}
                            </Text>
                        </View>
                        <Text style={styles.itemTotal}>₹{item.totalPrice}</Text>
                    </View>
                ))}
            </View>

            {/* Order Summary */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Summary</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>₹{order.subtotal}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery Fee</Text>
                    <Text style={styles.summaryValue}>₹{order.deliveryFee}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Tax</Text>
                    <Text style={styles.summaryValue}>₹{order.taxAmount}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{order.totalAmount}</Text>
                </View>
            </View>

            {/* Delivery Address */}
            {order.deliveryAddress && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Delivery Address</Text>
                    <View style={styles.addressContainer}>
                        <Text style={styles.addressType}>
                            {order.deliveryAddress.type.charAt(0).toUpperCase() + order.deliveryAddress.type.slice(1)}
                        </Text>
                        <Text style={styles.addressText}>{order.deliveryAddress.fullAddress}</Text>
                        {order.deliveryAddress.landmark && (
                            <Text style={styles.landmarkText}>{order.deliveryAddress.landmark}</Text>
                        )}
                        <Text style={styles.cityStateText}>
                            {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.pincode}
                        </Text>
                    </View>
                </View>
            )}

            {/* Order Timeline */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Timeline</Text>
                <View style={styles.timelineItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                    <View style={styles.timelineContent}>
                        <Text style={styles.timelineTitle}>Order Placed</Text>
                        <Text style={styles.timelineTime}>
                            {formatDate(order.orderPlacedAt)}
                        </Text>
                    </View>
                </View>

                {order.estimatedDeliveryTime && (
                    <View style={styles.timelineItem}>
                        <Ionicons
                            name="time-outline"
                            size={20}
                            color={order.status === 'delivered' ? '#28a745' : '#007AFF'}
                        />
                        <View style={styles.timelineContent}>
                            <Text style={styles.timelineTitle}>
                                {order.status === 'delivered' ? 'Delivered' : 'Estimated Delivery'}
                            </Text>
                            <Text style={styles.timelineTime}>
                                {formatDate(order.estimatedDeliveryTime)}
                            </Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Payment Info */}
            {order.payment && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Information</Text>
                    <View style={styles.paymentInfo}>
                        <Text style={styles.paymentMethod}>
                            Method: {order.payment.method.charAt(0).toUpperCase() + order.payment.method.slice(1)}
                        </Text>
                        <Text style={styles.paymentStatus}>
                            Status: {order.payment.status.charAt(0).toUpperCase() + order.payment.status.slice(1)}
                        </Text>
                    </View>
                </View>
            )}

            {/* Action Buttons */}
            {canCancel && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={handleCancelOrder}
                    >
                        <Ionicons name="close-circle" size={20} color="#fff" />
                        <Text style={styles.cancelButtonText}>Cancel Order</Text>
                    </TouchableOpacity>
                </View>
            )}
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        color: '#007AFF',
        fontSize: 16,
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
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusSection: {
        backgroundColor: '#fff',
        padding: 15,
        marginBottom: 10,
    },
    orderNumberContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
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
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
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
    itemTotal: {
        fontSize: 14,
        fontWeight: '600',
        color: '#007AFF',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
    },
    totalRow: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 10,
        marginTop: 10,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    addressContainer: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
    },
    addressType: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    addressText: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
        lineHeight: 20,
    },
    landmarkText: {
        fontSize: 12,
        color: '#666',
        marginBottom: 5,
    },
    cityStateText: {
        fontSize: 12,
        color: '#666',
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 15,
    },
    timelineContent: {
        marginLeft: 15,
        flex: 1,
    },
    timelineTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 2,
    },
    timelineTime: {
        fontSize: 12,
        color: '#666',
    },
    paymentInfo: {
        backgroundColor: '#f9f9f9',
        padding: 15,
        borderRadius: 8,
    },
    paymentMethod: {
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    paymentStatus: {
        fontSize: 14,
        color: '#333',
    },
    buttonContainer: {
        padding: 15,
    },
    cancelButton: {
        backgroundColor: '#dc3545',
        borderRadius: 8,
        padding: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});