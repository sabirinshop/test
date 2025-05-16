// Filename: assets/js/cart-module.js
// This module provides shared functions for shopping cart operations.

window.shopCartModule = (() => {
    const CART_STORAGE_KEY = 'shoppingCart';

    function getCart() {
        try {
            const cartData = localStorage.getItem(CART_STORAGE_KEY);
            return cartData ? JSON.parse(cartData) : [];
        } catch (e) {
            console.error("Error reading cart from localStorage:", e);
            return [];
        }
    }

    function saveCart(cart) {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
            window.dispatchEvent(new CustomEvent('cartUpdated', { 
                detail: { cart: cart, cartItemCount: getCartItemCount(cart) } 
            }));
        } catch (e) {
            console.error("Error saving cart to localStorage:", e);
        }
    }

    function getCartItemCount(currentCart = null) {
        const cart = currentCart || getCart();
        return cart.reduce((total, item) => total + (item.quantity || 0), 0);
    }

    function addToCart(productId, allProductsList) {
        if (!productId || !allProductsList) {
            console.error("Product ID and allProductsList are required to add to cart.");
            return false;
        }
        let cart = getCart();
        const existingProductIndex = cart.findIndex(item => item.id === productId);
        const productDetails = allProductsList.find(p => p.id === productId);

        if (!productDetails) {
            console.error(`Product details not found for ID ${productId}. Cannot add to cart.`);
            return false;
        }

        if (existingProductIndex > -1) {
            // Check stock before incrementing (if stock info is available here)
            // For now, just incrementing. Stock check should ideally be before calling addToCart by the UI.
            cart[existingProductIndex].quantity += 1;
        } else {
            cart.push({ 
                id: productId, 
                name: productDetails.name, 
                price: productDetails.price,
                imageUrl: productDetails.imageUrl,
                brandName: productDetails.brandName,
                stockCount: productDetails.stockCount, // Store stockCount for reference
                quantity: 1 
            });
        }
        saveCart(cart);
        return true;
    }

    function updateItemQuantity(productId, newQuantity) {
        let cart = getCart();
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = cart[itemIndex];
            if (newQuantity > 0) {
                // Optional: Check against stockCount if available in cart item
                // if (item.stockCount && newQuantity > item.stockCount) {
                //     alert(`দুঃখিত, "${item.name}" এর জন্য পর্যাপ্ত স্টক নেই। মাত্র ${item.stockCount}টি অবশিষ্ট আছে।`);
                //     return false; // Quantity update failed
                // }
                item.quantity = newQuantity;
            } else { // Quantity is 0 or less, remove item
                cart.splice(itemIndex, 1);
            }
            saveCart(cart);
            return true;
        }
        return false; // Item not found
    }

    function removeItemFromCart(productId) {
        let cart = getCart();
        const updatedCart = cart.filter(item => item.id !== productId);
        if (cart.length !== updatedCart.length) {
            saveCart(updatedCart);
            return true;
        }
        return false; // Item not found or not removed
    }
    
    function clearCart() {
        saveCart([]);
    }

    function generateWhatsAppOrderMessage(customerName, customerPhone, deliveryLocationLink) {
        const cart = getCart();
        if (cart.length === 0) {
            return "আপনার কার্ট খালি।";
        }

        let message = "অর্ডার ዝርዝር:\n"; // Order Details
        if (customerName) {
            message += `ক্রেতার নাম: ${customerName}\n`;
        }
        if (customerPhone) {
            message += `ফোন নম্বর: ${customerPhone}\n`;
        }
        message += "\nপণ্যের বিবরণ:\n";
        cart.forEach(item => {
            message += `- ${item.name} - পরিমাণ: ${item.quantity.toLocaleString('bn-BD')}\n`;
        });
        if (deliveryLocationLink) {
            message += `\nডেলিভারি লোকেশন: ${deliveryLocationLink}\n`;
        } else {
            message += `\nডেলিভারি লোকেশন: (অনুমতি দেওয়া হয়নি বা পাওয়া যায়নি)\n`;
        }
        message += "\nধন্যবাদ!";
        return message;
    }


    return {
        addToCart,
        getCart,
        getCartItemCount,
        updateItemQuantity,
        removeItemFromCart,
        clearCart, // Added for potential future use
        generateWhatsAppOrderMessage
    };
})();