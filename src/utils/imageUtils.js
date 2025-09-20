// Image utility functions for handling image URLs and fallbacks

export const getImageUrl = (baseUrl, imagePath) => {
    if (!imagePath) return null;

    // If imagePath is already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Construct full URL from base URL and image path
    const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    const cleanImagePath = imagePath.replace(/^\//, ''); // Remove leading slash

    return `${cleanBaseUrl}/${cleanImagePath}`;
};

export const getItemImageUrl = (item) => {
    // Check for various possible image field names
    if (item?.imageUrl) return item.imageUrl;
    if (item?.image) return item.image;
    if (item?.imagePath) return getImageUrl(__DEV__
        ? 'https://e4a15351e443.ngrok-free.app'
        : 'https://your-production-api.com', item.imagePath);

    return null;
};

export const getImagePlaceholder = (name) => {
    return name ? name.charAt(0).toUpperCase() : '?';
};