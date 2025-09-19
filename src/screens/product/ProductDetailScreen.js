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
import { itemsAPI, cartAPI } from '../../services/api';

export default function ProductDetailScreen() {
    const [item, setItem] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const navigation = useNavigation();
    const route = useRoute();
    const { item: itemData } = route.params || {};

    useEffect(() => {
        if (itemData) {
            setItem(itemData);
            setIsLoading(false);
        } else {
            // If no item data is passed, go back
            Alert.alert('Error', 'Item data not found');
            navigation.goBack();
        }
    }, [itemData, navigation]);

    const loadItemDetails = async () => {
        try {
            setIsLoading(true);
            // In a real app, you'd get the item ID from route params
            // const response = await itemsAPI.getItemById(itemId);
            // For now, we'll just use the passed item data
        } catch (error) {
            console.error('Error loading item details:', error);
            Alert.alert('Error', 'Failed to load item details');
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = async () => {
        if (!item) return;

        try {
            setIsAddingToCart(true);
            const response = await cartAPI.addToCart({
                itemId: item.id,
                quantity: quantity,
            });

            if (response.data.success) {
                Alert.alert('Success', 'Item added to cart!', [
                    { text: 'Continue Shopping' },
                    {
                        text: 'Go to Cart',
                        onPress: () => navigation.navigate('Cart'),
                    },
                ]);
            } else {
                Alert.alert('Error', response.data.message);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add item to cart');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const updateQuantity = (newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= (item?.quantity || 99)) {
            setQuantity(newQuantity);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    if (!item) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Item not found</Text>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>Go Back</Text>
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
                <TouchableOpacity style={styles.favoriteButton}>
                    <Ionicons name="heart-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            {/* Product Image */}
            <View style={styles.imageContainer}>
                <View style={styles.productImage}>
                    <Text style={styles.imageText}>
                        {item.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCategory}>{item.category}</Text>

                <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    {item.discount > 0 && (
                        <View style={styles.discountContainer}>
                            <Text style={styles.discountText}>{item.discount}% off</Text>
                        </View>
                    )}
                </View>

                <Text style={styles.unitText}>Unit: {item.unit}</Text>
                <Text
                    style={[
                        styles.stockText,
                        { color: item.quantity > 0 ? '#28a745' : '#dc3545' },
                    ]}
                >
                    {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
                </Text>
            </View>

            {/* Description */}
            {item.description && (
                <View style={styles.descriptionContainer}>
                    <Text style={styles.sectionTitle}>Description</Text>
                    <Text style={styles.description}>{item.description}</Text>
                </View>
            )}

            {/* Quantity Selector */}
            <View style={styles.quantityContainer}>
                <Text style={styles.sectionTitle}>Quantity</Text>
                <View style={styles.quantitySelector}>
                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(quantity - 1)}
                        disabled={quantity <= 1}
                    >
                        <Ionicons
                            name="remove"
                            size={20}
                            color={quantity <= 1 ? '#ccc' : '#007AFF'}
                        />
                    </TouchableOpacity>

                    <Text style={styles.quantityText}>{quantity}</Text>

                    <TouchableOpacity
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(quantity + 1)}
                        disabled={quantity >= item.quantity}
                    >
                        <Ionicons
                            name="add"
                            size={20}
                            color={quantity >= item.quantity ? '#ccc' : '#007AFF'}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Add to Cart Button */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[
                        styles.addToCartButton,
                        (item.quantity === 0 || isAddingToCart) && styles.buttonDisabled,
                    ]}
                    onPress={addToCart}
                    disabled={item.quantity === 0 || isAddingToCart}
                >
                    {isAddingToCart ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="basket" size={20} color="#fff" />
                            <Text style={styles.addToCartText}>
                                Add to Cart • ₹{item.price * quantity}
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
        backgroundColor: '#fff',
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
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        paddingTop: 50,
    },
    favoriteButton: {
        padding: 8,
    },
    imageContainer: {
        alignItems: 'center',
        padding: 20,
    },
    productImage: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageText: {
        color: '#fff',
        fontSize: 80,
        fontWeight: 'bold',
    },
    productInfo: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    productName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    productCategory: {
        fontSize: 16,
        color: '#666',
        marginBottom: 15,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    productPrice: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#007AFF',
        marginRight: 10,
    },
    discountContainer: {
        backgroundColor: '#28a745',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    discountText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    unitText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    stockText: {
        fontSize: 14,
        fontWeight: '600',
    },
    descriptionContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    quantityContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 20,
        minWidth: 40,
        textAlign: 'center',
    },
    buttonContainer: {
        padding: 20,
    },
    addToCartButton: {
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
    addToCartText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});