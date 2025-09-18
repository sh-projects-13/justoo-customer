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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { itemsAPI, cartAPI } from '../services/api';

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

    const addToCart = async (item) => {
        try {
            const response = await cartAPI.addToCart({
                itemId: item.id,
                quantity: 1,
            });

            if (response.data.success) {
                Alert.alert('Success', 'Item added to cart!');
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

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.itemCard}
            onPress={() => navigation.navigate('ProductDetail', { item })}
        >
            <View style={styles.itemImage}>
                <Text style={styles.itemImageText}>
                    {item.name.charAt(0).toUpperCase()}
                </Text>
            </View>
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

    const renderCategory = ({ item }) => (
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

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={() => handleSearch(searchQuery)}
                    returnKeyType="search"
                />
                {isSearching && <ActivityIndicator size="small" color="#007AFF" />}
            </View>

            {/* Categories */}
            <View style={styles.categoriesContainer}>
                <FlatList
                    data={categories}
                    renderItem={renderCategory}
                    keyExtractor={(item) => item.category}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoriesList}
                />
            </View>

            {/* Clear Filters */}
            {(selectedCategory || searchQuery) && (
                <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                    <Text style={styles.clearButtonText}>Clear Filters</Text>
                </TouchableOpacity>
            )}

            {/* Featured Items */}
            {featuredItems.length > 0 && !selectedCategory && !searchQuery && (
                <View style={styles.featuredContainer}>
                    <Text style={styles.sectionTitle}>Featured Items</Text>
                    <FlatList
                        data={featuredItems}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.featuredList}
                    />
                </View>
            )}

            {/* All Items */}
            <View style={styles.itemsContainer}>
                <Text style={styles.sectionTitle}>
                    {selectedCategory ? `${selectedCategory} Items` : searchQuery ? 'Search Results' : 'All Items'}
                </Text>
                <FlatList
                    data={items}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    contentContainerStyle={styles.itemsList}
                    showsVerticalScrollIndicator={false}
                />
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        margin: 15,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
    },
    categoriesContainer: {
        marginBottom: 10,
    },
    categoriesList: {
        paddingHorizontal: 15,
    },
    categoryChip: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 10,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    categoryChipSelected: {
        backgroundColor: '#007AFF',
    },
    categoryText: {
        fontSize: 14,
        color: '#333',
    },
    categoryTextSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    clearButton: {
        alignSelf: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 15,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    clearButtonText: {
        color: '#007AFF',
        fontWeight: '600',
    },
    featuredContainer: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 15,
        marginBottom: 10,
    },
    featuredList: {
        paddingHorizontal: 15,
    },
    itemsContainer: {
        flex: 1,
    },
    itemsList: {
        padding: 15,
    },
    itemCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        margin: 5,
        flex: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemImageText: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 5,
    },
    itemDiscount: {
        fontSize: 12,
        color: '#28a745',
        fontWeight: '600',
    },
    addButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: '#007AFF',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
});