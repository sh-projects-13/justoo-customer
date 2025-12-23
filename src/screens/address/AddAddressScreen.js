import React, { useState } from "react";
import * as Location from "expo-location";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { addressesAPI } from "../../services/api";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AddAddressScreen() {
    const [formData, setFormData] = useState({
        type: "home",
        label: "",
        fullAddress: "",
        landmark: "",
        pincode: "",
        city: "",
        state: "",
        country: "India",
        latitude: null,
        longitude: null,
        isDefault: false,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);
    const navigation = useNavigation();

    const addressTypes = [
        { key: "home", label: "Home", icon: "home" },
        { key: "work", label: "Work", icon: "business" },
        { key: "other", label: "Other", icon: "location" },
    ];

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const validateForm = () => {
        if (!formData.fullAddress.trim()) {
            Alert.alert("Error", "Please enter your full address");
            return false;
        }
        if (!formData.city.trim()) {
            Alert.alert("Error", "Please enter your city");
            return false;
        }
        if (!formData.state.trim()) {
            Alert.alert("Error", "Please enter your state");
            return false;
        }
        if (!formData.pincode.trim()) {
            Alert.alert("Error", "Please enter your pincode");
            return false;
        }
        if (
            formData.pincode.length !== 6 ||
            !/^\d{6}$/.test(formData.pincode)
        ) {
            Alert.alert("Error", "Please enter a valid 6-digit pincode");
            return false;
        }
        return true;
    };

    const handleSaveAddress = async () => {
        if (!validateForm()) {
            return;
        }

        try {
            setIsLoading(true);
            const response = await addressesAPI.addAddress(formData);

            if (response.data.success) {
                Alert.alert("Success", "Address added successfully!", [
                    {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                    },
                ]);
            } else {
                Alert.alert(
                    "Error",
                    response.data.message || "Failed to add address"
                );
            }
        } catch (error) {
            console.error("Error adding address:", error);
            Alert.alert("Error", "Failed to add address. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        try {
            setIsFetchingLocation(true); // start loader

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                Alert.alert(
                    "Permission Denied",
                    "Allow location access to use this feature."
                );
                setIsFetchingLocation(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            const { latitude, longitude } = location.coords;

            handleInputChange("latitude", latitude);
            handleInputChange("longitude", longitude);

            // Reverse Geocode
            let reverseGeocode = await Location.reverseGeocodeAsync({
                latitude,
                longitude,
            });

            if (reverseGeocode.length > 0) {
                const place = reverseGeocode[0];
                handleInputChange("city", place.city || "");
                handleInputChange("state", place.region || "");
                handleInputChange("pincode", place.postalCode || "");
                handleInputChange("country", place.country || "");

                const approxAddress = [
                    place.name,
                    place.street,
                    place.district,
                    place.city,
                    place.region,
                ]
                    .filter(Boolean)
                    .join(", ");

                handleInputChange("fullAddress", approxAddress);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Unable to fetch location");
        } finally {
            setIsFetchingLocation(false); // stop loader
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Add New Address</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Address Type Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Address Type</Text>
                    <View style={styles.typeContainer}>
                        {addressTypes.map((type) => (
                            <TouchableOpacity
                                key={type.key}
                                style={[
                                    styles.typeButton,
                                    formData.type === type.key &&
                                        styles.typeButtonSelected,
                                ]}
                                onPress={() =>
                                    handleInputChange("type", type.key)
                                }
                            >
                                <Ionicons
                                    name={type.icon}
                                    size={20}
                                    color={
                                        formData.type === type.key
                                            ? "#fff"
                                            : "#007AFF"
                                    }
                                />
                                <Text
                                    style={[
                                        styles.typeText,
                                        formData.type === type.key &&
                                            styles.typeTextSelected,
                                    ]}
                                >
                                    {type.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.locationButton}
                        onPress={getCurrentLocation}
                        disabled={isFetchingLocation} // disable button while loading
                    >
                        {isFetchingLocation ? (
                            <ActivityIndicator color="#007AFF" />
                        ) : (
                            <>
                                <Ionicons
                                    name="location"
                                    size={20}
                                    color="#007AFF"
                                />
                                <Text style={styles.locationButtonText}>
                                    Use Current Location
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {formData.latitude && formData.longitude && (
                        <Text style={styles.coordinatesText}>
                            Location: {formData.latitude.toFixed(4)},{" "}
                            {formData.longitude.toFixed(4)}
                        </Text>
                    )}
                </View>
                {/* Address Label */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Label (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., My Home, Office, etc."
                        value={formData.label}
                        onChangeText={(text) =>
                            handleInputChange("label", text)
                        }
                        maxLength={50}
                    />
                </View>

                {/* Full Address */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Full Address *</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="House/Flat no., Building name, Area, Street"
                        value={formData.fullAddress}
                        onChangeText={(text) =>
                            handleInputChange("fullAddress", text)
                        }
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                    />
                </View>

                {/* Landmark */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Landmark (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nearby landmark or building"
                        value={formData.landmark}
                        onChangeText={(text) =>
                            handleInputChange("landmark", text)
                        }
                    />
                </View>

                {/* Location Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location Details</Text>

                    <View style={styles.row}>
                        <View style={styles.inputHalf}>
                            <Text style={styles.inputLabel}>City *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="City"
                                value={formData.city}
                                onChangeText={(text) =>
                                    handleInputChange("city", text)
                                }
                            />
                        </View>

                        <View style={styles.inputHalf}>
                            <Text style={styles.inputLabel}>Pincode *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="6-digit pincode"
                                value={formData.pincode}
                                onChangeText={(text) =>
                                    handleInputChange("pincode", text)
                                }
                                keyboardType="numeric"
                                maxLength={6}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={styles.inputHalf}>
                            <Text style={styles.inputLabel}>State *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="State"
                                value={formData.state}
                                onChangeText={(text) =>
                                    handleInputChange("state", text)
                                }
                            />
                        </View>

                        <View style={styles.inputHalf}>
                            <Text style={styles.inputLabel}>Country</Text>
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={formData.country}
                                editable={false}
                            />
                        </View>
                    </View>
                </View>

                {/* Location Services */}

                {/* Default Address */}
                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.defaultContainer}
                        onPress={() =>
                            handleInputChange("isDefault", !formData.isDefault)
                        }
                    >
                        <View style={styles.checkboxContainer}>
                            <Ionicons
                                name={
                                    formData.isDefault
                                        ? "checkbox"
                                        : "square-outline"
                                }
                                size={24}
                                color="#007AFF"
                            />
                            <Text style={styles.defaultText}>
                                Set as default address
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Save Button */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.saveButton,
                            isLoading && styles.saveButtonDisabled,
                        ]}
                        onPress={handleSaveAddress}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="save" size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>
                                    Save Address
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        padding: 15,
        paddingTop: 50,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    section: {
        backgroundColor: "#fff",
        marginTop: 15,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 15,
    },
    typeContainer: {
        flexDirection: "row",
        gap: 10,
    },
    typeButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#007AFF",
        backgroundColor: "#fff",
    },
    typeButtonSelected: {
        backgroundColor: "#007AFF",
    },
    typeText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: "500",
        color: "#007AFF",
    },
    typeTextSelected: {
        color: "#fff",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    textArea: {
        height: 80,
        textAlignVertical: "top",
    },
    disabledInput: {
        backgroundColor: "#f8f8f8",
        color: "#666",
    },
    row: {
        flexDirection: "row",
        gap: 10,
    },
    inputHalf: {
        flex: 1,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        color: "#666",
        marginBottom: 8,
    },
    locationButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#007AFF",
        backgroundColor: "#fff",
    },
    locationButtonText: {
        marginLeft: 8,
        fontSize: 16,
        color: "#007AFF",
        fontWeight: "500",
    },
    coordinatesText: {
        marginTop: 10,
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
    defaultContainer: {
        paddingVertical: 10,
    },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    defaultText: {
        marginLeft: 12,
        fontSize: 16,
        color: "#333",
    },
    buttonContainer: {
        padding: 20,
        paddingBottom: 40,
    },
    saveButton: {
        backgroundColor: "#007AFF",
        borderRadius: 8,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    saveButtonDisabled: {
        backgroundColor: "#ccc",
    },
    saveButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 8,
    },
});
