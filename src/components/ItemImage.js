import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { getItemImageUrl, getImagePlaceholder } from '../utils/imageUtils';

const ItemImage = ({
    item,
    size = 60,
    style = {},
    textStyle = {},
    placeholderStyle = {},
    imageStyle = {}
}) => {
    const imageUrl = getItemImageUrl(item);
    const placeholder = getImagePlaceholder(item?.name);

    const containerStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        ...style,
    };

    return (
        <View style={containerStyle}>
            {imageUrl ? (
                <Image
                    source={{ uri: imageUrl }}
                    style={[styles.image, imageStyle]}
                    resizeMode="cover"
                />
            ) : (
                <View style={[styles.placeholder, placeholderStyle]}>
                    <Text style={[styles.placeholderText, { fontSize: size * 0.4 }, textStyle]}>
                        {placeholder}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    image: {
        width: '100%',
        height: '100%',
    },
    placeholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});

export default ItemImage;