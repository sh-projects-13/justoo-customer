import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { itemsAPI, cartAPI } from '../services/api';
import ItemImage from '../components/ItemImage';
import { colors, spacing, typography, radius, shadow } from '../theme';

export default function HomeScreen() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [featuredItems, setFeaturedItems] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const navigation = useNavigation();

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const [itemsResponse, categoriesResponse, featuredResponse] = await Promise.all([
                itemsAPI.getItems({ limit: 20 }),
                itemsAPI.getCategories(),
                itemsAPI.getFeaturedItems(),
            ]);

            if (itemsResponse.data.success) {
                setItems(itemsResponse.data.data.items);
            }
            if (categoriesResponse.data.success) {
                setCategories(categoriesResponse.data.data);
            }
            if (featuredResponse.data.success) {
                setFeaturedItems(featuredResponse.data.data);
            }
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query) => {
        if (!query.trim()) {
            setSearchQuery('');
            loadInitialData();
            return;
        }

        try {
            setIsSearching(true);
            const response = await itemsAPI.searchItems(query);
            if (response.data.success) {
                setItems(response.data.data.results);
                setSearchQuery(query);
            }
        } catch (error) {
            console.error('Search error:', error);
            Alert.alert('Error', 'Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleCategorySelect = async (category) => {
        setSelectedCategory(category);
        try {
            setIsSearching(true);
            const response = await itemsAPI.getItemsByCategory(category, { limit: 20 });
            if (response.data.success) {
                setItems(response.data.data.items || []);
            }
        } catch (error) {
            console.error('Category filter error:', error);
            Alert.alert('Error', 'Could not load this category');
        } finally {
            setIsSearching(false);
        }
    };

    const addToCart = async (item) => {
        if (!item || !item.id) {
            Alert.alert('Error', 'Invalid item data');
            return;
        }

        try {
            const response = await cartAPI.addToCart({
                itemId: item.id,
                quantity: 1,
            });

            if (response.data.success) {
                Alert.alert('Success', 'Item added to cart!', [
                    { text: 'Continue Shopping', style: 'cancel' },
                    {
                        text: 'View Cart',
                        onPress: () => navigation.navigate('Cart')
                    }
                ]);
            } else {
                Alert.alert('Error', response.data.message);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            Alert.alert('Error', 'Failed to add item to cart');
        }
    };

    const clearFilters = () => {
        setSelectedCategory(null);
        setSearchQuery('');
        loadInitialData();
    };

    const renderItem = ({ item }) => {
        if (!item || !item.name || !item.price) {
            return null; // Skip rendering if item data is incomplete
        }

        return (
            <TouchableOpacity
                style={styles.itemCard}
                onPress={() => navigation.navigate('ProductDetail', { item })}
            >
                <ItemImage item={item} size={60} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                    {item.discount > 0 && (
                        <Text style={styles.itemDiscount}>
                            {item.discount}% off
                        </Text>
                    )}
                </View>
                <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
                    <Ionicons name="add" size={20} color="#fff" />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    const renderCategory = ({ item }) => {
        if (!item || !item.category) {
            return null; // Skip rendering if category data is incomplete
        }

        return (
            <TouchableOpacity
                style={[
                    styles.categoryChip,
                    selectedCategory === item.category && styles.categoryChipSelected,
                ]}
                onPress={() => handleCategorySelect(item.category)}
            >
                <Text
                    style={[
                        styles.categoryText,
                        selectedCategory === item.category && styles.categoryTextSelected,
                    ]}
                >
                    {item.category}
                </Text>
            </TouchableOpacity>
        );
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={items?.filter(item => item != null) || []}
                renderItem={renderItem}
                keyExtractor={(item, index) => item?.id?.toString() || `item-${index}`}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={(
                    <View>
                        <View style={styles.heroCard}>
                            <View style={styles.heroRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.heroEyebrow}>Delivery in 10 min</Text>
                                    <Text style={styles.heroTitle}>Groceries, snacks & essentials</Text>
                                    <View style={styles.heroTags}>
                                        <View style={styles.tagPill}>
                                            <Ionicons name="flash" size={14} color={colors.accent} />
                                            <Text style={styles.tagText}>Lightning fast</Text>
                                        </View>
                                        <View style={styles.tagPillMuted}>
                                            <Ionicons name="pricetag" size={14} color={colors.textMuted} />
                                            <Text style={styles.tagTextMuted}>Deals near you</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardShell}>
                                <View style={styles.searchContainer}>
                                    <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search fruits, veggies, snacks..."
                                        placeholderTextColor={colors.textMuted}
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                        onSubmitEditing={() => handleSearch(searchQuery)}
                                        returnKeyType="search"
                                    />
                                    {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
                                </View>

                                <FlatList
                                    data={categories?.filter(item => item != null) || []}
                                    renderItem={renderCategory}
                                    keyExtractor={(item, index) => item?.category?.toString() || `cat-${index}`}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.categoriesList}
                                />

                                {(selectedCategory || searchQuery) && (
                                    <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                                        <Ionicons name="close" size={16} color={colors.primary} />
                                        <Text style={styles.clearButtonText}>Clear filters</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {featuredItems.length > 0 && !selectedCategory && !searchQuery && (
                            <View style={styles.featuredContainer}>
                                <View style={styles.sectionHeaderRow}>
                                    <Text style={styles.sectionTitle}>Trending near you</Text>
                                    <Ionicons name="flame" size={18} color={colors.accent} />
                                </View>
                                <FlatList
                                    data={featuredItems?.filter(item => item != null) || []}
                                    renderItem={renderItem}
                                    keyExtractor={(item, index) => item?.id?.toString() || `feat-${index}`}
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.featuredList}
                                />
                            </View>
                        )}

                        <View style={styles.itemsHeaderRow}>
                            <Text style={styles.sectionTitle}>
                                {selectedCategory ? `${selectedCategory} picks` : searchQuery ? 'Search results' : 'All items'}
                            </Text>
                            <View style={styles.badgePill}>
                                <Ionicons name="leaf" size={14} color={colors.primary} />
                                <Text style={styles.badgePillText}>Fresh stock</Text>
                            </View>
                        </View>
                    </View>
                )}
            />
        </View>
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
    heroCard: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.lg,
        ...shadow.card,
    },
    heroRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    heroEyebrow: {
        color: colors.accent,
        fontSize: typography.small,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    heroTitle: {
        color: colors.text,
        fontSize: typography.h1,
        fontWeight: '800',
        lineHeight: 32,
        marginBottom: spacing.sm,
    },
    heroTags: {
        flexDirection: 'row',
        marginTop: spacing.xs,
    },
    tagPill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: '#FFF7EB',
        borderRadius: radius.md,
        marginRight: spacing.sm,
    },
    tagText: {
        color: colors.accent,
        fontSize: typography.small,
        fontWeight: '700',
    },
    tagPillMuted: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        backgroundColor: '#EEF2FF',
        borderRadius: radius.md,
        marginRight: spacing.sm,
    },
    tagTextMuted: {
        color: colors.text,
        fontSize: typography.small,
        fontWeight: '600',
    },
    heroBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 110,
        ...shadow.soft,
    },
    heroBadgeText: {
        color: colors.card,
        fontWeight: '700',
        fontSize: typography.small,
        marginTop: 2,
    },
    cardShell: {
        backgroundColor: colors.card,
        marginTop: spacing.md,
        borderRadius: radius.lg,
        padding: spacing.md,
        ...shadow.soft,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.page,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: typography.body,
        color: colors.text,
    },
    categoriesList: {
        paddingTop: spacing.md,
    },
    categoryChip: {
        backgroundColor: colors.page,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.lg,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    categoryChipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryText: {
        fontSize: typography.small,
        color: colors.text,
        fontWeight: '600',
    },
    categoryTextSelected: {
        color: colors.card,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        backgroundColor: '#E8F7EF',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.lg,
        marginTop: spacing.sm,
    },
    clearButtonText: {
        color: colors.primary,
        fontWeight: '700',
        marginLeft: spacing.xs,
    },
    featuredContainer: {
        marginTop: spacing.md,
        paddingHorizontal: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.h2,
        fontWeight: '800',
        color: colors.text,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.sm,
    },
    featuredList: {
        paddingHorizontal: spacing.xs,
    },
    listContent: {
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.lg,
        paddingTop: spacing.md,
    },
    itemsHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    itemCard: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        padding: spacing.md,
        marginBottom: spacing.md,
        flexBasis: '48%',
        ...shadow.soft,
    },
    itemImage: {
        marginBottom: spacing.sm,
        alignSelf: 'center',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: typography.body,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    itemPrice: {
        fontSize: typography.h3,
        fontWeight: '800',
        color: colors.primary,
        marginBottom: spacing.xs,
    },
    itemDiscount: {
        fontSize: typography.small,
        color: colors.accent,
        fontWeight: '700',
    },
    addButton: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        backgroundColor: colors.primary,
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadow.soft,
    },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F7EF',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.lg,
    },
    badgePillText: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: typography.small,
    },
});