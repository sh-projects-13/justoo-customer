import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { itemsAPI, cartAPI } from '../../services/api';
import ItemImage from '../../components/ItemImage';
import { colors, spacing, typography, radius, shadow } from '../../theme';

export default function ProductDetailScreen() {
    const [item, setItem] = useState(null);
    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                    <Ionicons name="heart-outline" size={22} color={colors.text} />
                </TouchableOpacity>
            </View>

            <View style={styles.imageContainer}>
                <ItemImage
                    item={item}
                    size={220}
                    textStyle={styles.imageText}
                />
                <View style={styles.ribbon}>
                    <Ionicons name="leaf" size={14} color={colors.card} />
                    <Text style={styles.ribbonText}>Fresh</Text>
                </View>
            </View>

            <View style={styles.contentCard}>
                <View style={styles.titleRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.productName}>{item.name}</Text>
                        <Text style={styles.productCategory}>{item.category}</Text>
                    </View>
                    <View style={styles.priceChip}>
                        <Ionicons name="time" size={14} color={colors.primary} />
                        <Text style={styles.priceChipText}>10 min</Text>
                    </View>
                </View>

                <View style={styles.priceContainer}>
                    <Text style={styles.productPrice}>₹{item.price}</Text>
                    {item.discount > 0 && (
                        <View style={styles.discountContainer}>
                            <Text style={styles.discountText}>{item.discount}% OFF</Text>
                        </View>
                    )}
                </View>

                <View style={styles.metaRow}>
                    <Text style={styles.unitText}>Unit: {item.unit}</Text>
                    <Text
                        style={[
                            styles.stockText,
                            { color: item.quantity > 0 ? colors.success : colors.danger },
                        ]}
                    >
                        {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
                    </Text>
                </View>

                {item.description && (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.sectionTitle}>About this item</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                )}

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
                                size={18}
                                color={quantity <= 1 ? colors.textMuted : colors.primary}
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
                                size={18}
                                color={quantity >= item.quantity ? colors.textMuted : colors.primary}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={styles.bottomCard}>
                <View>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>₹{item.price * quantity}</Text>
                </View>
                <TouchableOpacity
                    style={[
                        styles.addToCartButton,
                        (item.quantity === 0 || isAddingToCart) && styles.buttonDisabled,
                    ]}
                    onPress={addToCart}
                    disabled={item.quantity === 0 || isAddingToCart}
                >
                    {isAddingToCart ? (
                        <ActivityIndicator color={colors.card} />
                    ) : (
                        <>
                            <Ionicons name="basket" size={18} color={colors.card} />
                            <Text style={styles.addToCartText}>Add to cart</Text>
                        </>
                    )}
                </TouchableOpacity>
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
            {
                item.description && (
                    <View style={styles.descriptionContainer}>
                        <Text style={styles.sectionTitle}>Description</Text>
                        <Text style={styles.description}>{item.description}</Text>
                    </View>
                )
            }

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
        backgroundColor: colors.page,
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingTop: 50,
    },
    iconButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.soft,
    },
    imageContainer: {
        alignItems: 'center',
        padding: spacing.lg,
        position: 'relative',
    },
    imageText: {
        fontSize: 80,
    },
    ribbon: {
        position: 'absolute',
        top: spacing.lg,
        right: spacing.lg,
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: spacing.xs,
        ...shadow.soft,
    },
    ribbonText: {
        color: colors.card,
        fontWeight: '700',
        fontSize: typography.small,
    },
    contentCard: {
        backgroundColor: colors.card,
        marginHorizontal: spacing.md,
        borderRadius: radius.lg,
        padding: spacing.lg,
        ...shadow.card,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    productName: {
        fontSize: typography.h1,
        fontWeight: '800',
        color: colors.text,
    },
    productCategory: {
        fontSize: typography.body,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    priceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F7EF',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
        marginLeft: spacing.xs,
    },
    priceChipText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: typography.small,
    },
    priceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.sm,
    },
    productPrice: {
        fontSize: 30,
        fontWeight: '800',
        color: colors.primary,
    },
    discountContainer: {
        backgroundColor: '#FFECDC',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.md,
    },
    discountText: {
        color: colors.accent,
        fontSize: typography.small,
        fontWeight: '800',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    unitText: {
        fontSize: typography.body,
        color: colors.textMuted,
    },
    stockText: {
        fontSize: typography.body,
        fontWeight: '700',
    },
    descriptionContainer: {
        marginTop: spacing.md,
        padding: spacing.md,
        backgroundColor: '#F8FAFB',
        borderRadius: radius.md,
    },
    sectionTitle: {
        fontSize: typography.h3,
        fontWeight: '800',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    description: {
        fontSize: typography.body,
        color: colors.textMuted,
        lineHeight: 22,
    },
    quantityContainer: {
        marginTop: spacing.lg,
    },
    quantitySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: 160,
        marginTop: spacing.sm,
    },
    quantityButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 1,
        borderColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.card,
        ...shadow.soft,
    },
    quantityText: {
        fontSize: typography.h2,
        fontWeight: '800',
        minWidth: 40,
        textAlign: 'center',
        color: colors.text,
    },
    bottomCard: {
        backgroundColor: colors.card,
        margin: spacing.md,
        marginTop: spacing.lg,
        borderRadius: radius.lg,
        padding: spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        ...shadow.card,
    },
    totalLabel: {
        color: colors.textMuted,
        fontSize: typography.small,
        marginBottom: spacing.xs,
    },
    totalValue: {
        color: colors.text,
        fontSize: typography.h2,
        fontWeight: '800',
    },
    addToCartButton: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadow.soft,
    },
    buttonDisabled: {
        backgroundColor: colors.border,
    },
    addToCartText: {
        color: colors.card,
        fontSize: typography.body,
        fontWeight: '800',
        marginLeft: spacing.xs,
    },
});