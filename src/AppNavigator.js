import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";

// Import navigators
import AuthNavigator from "./navigation/AuthNavigator";
import TabNavigator from "./navigation/TabNavigator";

// Import context
import { AuthProvider, useAuth } from "./context/AuthContext";

const Stack = createStackNavigator();

function AppNavigator() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        // You can create a loading screen component
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isAuthenticated ? (
                    <Stack.Screen name="Main" component={TabNavigator} />
                ) : (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                )}
            </Stack.Navigator>
            <StatusBar style="auto" />
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
}
