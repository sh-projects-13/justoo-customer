# Justoo Customer App

A React Native mobile application for the Justoo 10-minute delivery service.

## Features

- **User Authentication**: Sign up, login, and session management
- **Product Browsing**: Browse products by category, search, and view details
- **Shopping Cart**: Add/remove items, update quantities, and checkout
- **Order Management**: Place orders, track status, and view order history
- **Address Management**: Add, edit, and manage delivery addresses
- **Profile Management**: View and update user profile

## Tech Stack

- **React Native** with Expo
- **React Navigation** for navigation
- **Axios** for API calls
- **AsyncStorage** for local data storage
- **Context API** for state management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Backend server running (see backend README)

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm start
   ```

3. Run on device/emulator:

   ```bash
   # For iOS
   npm run ios

   # For Android
   npm run android

   # For web
   npm run web
   ```

## Backend Integration

This app connects to the Justoo backend API. Make sure the backend is running on the correct URL.

For development:

- Backend URL: `http://localhost:3002/api`
- For physical devices, replace `localhost` with your computer's IP address

## Project Structure

```
src/
├── context/
│   └── AuthContext.js          # Authentication state management
├── navigation/
│   ├── AuthNavigator.js        # Authentication screens navigation
│   └── TabNavigator.js         # Main app tabs navigation
├── screens/
│   ├── auth/
│   │   ├── LoginScreen.js
│   │   └── RegisterScreen.js
│   ├── HomeScreen.js           # Product listing and search
│   ├── CartScreen.js           # Shopping cart
│   ├── OrdersScreen.js         # Order history
│   ├── ProfileScreen.js        # User profile
│   ├── product/
│   │   └── ProductDetailScreen.js
│   ├── checkout/
│   │   └── CheckoutScreen.js
│   ├── order/
│   │   └── OrderDetailScreen.js
│   └── address/
│       └── AddressesScreen.js
└── services/
    └── api.js                  # API service layer
```

## API Endpoints

The app integrates with the following backend endpoints:

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/logout` - User logout

### Products

- `GET /items` - Get products with filtering
- `GET /items/:id` - Get product details
- `GET /items/categories` - Get product categories
- `GET /items/search` - Search products

### Cart

- `GET /cart` - Get user's cart
- `POST /cart/add` - Add item to cart
- `PUT /cart/item/:itemId` - Update cart item
- `DELETE /cart/item/:itemId` - Remove item from cart
- `DELETE /cart` - Clear cart

### Orders

- `POST /orders` - Create new order
- `GET /orders` - Get user's orders
- `GET /orders/:orderId` - Get order details
- `PUT /orders/:orderId/cancel` - Cancel order

### Addresses

- `GET /addresses` - Get user's addresses
- `POST /addresses` - Add new address
- `PUT /addresses/:addressId` - Update address
- `DELETE /addresses/:addressId` - Delete address
- `PUT /addresses/:addressId/default` - Set default address

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is part of the Justoo delivery service system.
