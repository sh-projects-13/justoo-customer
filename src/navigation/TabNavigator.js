import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme";

// Import screens
import HomeScreen from "../screens/HomeScreen";
import CartScreen from "../screens/CartScreen";
import OrdersScreen from "../screens/OrdersScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ProductDetailScreen from "../screens/product/ProductDetailScreen";
import CheckoutScreen from "../screens/checkout/CheckoutScreen";
import AddressesScreen from "../screens/address/AddressesScreen";
import AddAddressScreen from "../screens/address/AddAddressScreen";
import EditAddressScreen from "../screens/address/EditAddressScreen";
import OrderDetailScreen from "../screens/order/OrderDetailScreen";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack
function HomeStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="HomeMain" component={HomeScreen} />
            <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
            />
        </Stack.Navigator>
    );
}

// Cart Stack
function CartStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="CartMain" component={CartScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
        </Stack.Navigator>
    );
}

// Orders Stack
function OrdersStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="OrdersMain" component={OrdersScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        </Stack.Navigator>
    );
}

// Profile Stack
function ProfileStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="ProfileMain" component={ProfileScreen} />
            <Stack.Screen name="Addresses" component={AddressesScreen} />
            <Stack.Screen name="AddAddress" component={AddAddressScreen} />
            <Stack.Screen name="EditAddress" component={EditAddressScreen} />
        </Stack.Navigator>
    );
}

export default function TabNavigator() {
    const insets = useSafeAreaInsets();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === "Home") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "Cart") {
                        iconName = focused ? "basket" : "basket-outline";
                    } else if (route.name === "Orders") {
                        iconName = focused ? "list" : "list-outline";
                    } else if (route.name === "Profile") {
                        iconName = focused ? "person" : "person-outline";
                    }

                    return (
                        <Ionicons name={iconName} size={size} color={color} />
                    );
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                headerStyle: {
                    backgroundColor: colors.card,
                },

                headerTintColor: colors.text,
                headerTitleStyle: {
                    fontWeight: "800",
                },
                tabBarStyle: {
                    backgroundColor: colors.card,
                    borderTopColor: "transparent",
                    height: 60 + insets.bottom,
                    paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
                    paddingTop: 8,
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{ title: "Justoo" }}
            />
            <Tab.Screen
                name="Cart"
                component={CartStack}
                options={{ title: "Cart" }}
            />
            <Tab.Screen
                name="Orders"
                component={OrdersStack}
                options={{ title: "Orders" }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileStack}
                options={{ title: "Profile" }}
            />
        </Tab.Navigator>
    );
}
