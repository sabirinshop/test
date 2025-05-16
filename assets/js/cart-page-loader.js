// Filename: assets/js/cart-page-loader.js
document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const totalItemsCountElement = document.getElementById('total-items-count');
    const totalCartPriceElement = document.getElementById('total-cart-price');
    const placeOrderButton = document.getElementById('place-order-btn');
    const customerNameInput = document.getElementById('customerName');
    const customerPhoneInput = document.getElementById('customerPhone');

    const locationModal = document.getElementById('cartLocationPermissionModal');
    const grantLocationModalBtn = document.getElementById('grantCartLocationBtn');
    const closeLocationModalBtn = document.getElementById('closeCartLocationModal');
    const locationStatusMsgElement = document.getElementById('locationStatusMsg');

    const SHOP_PHONE_NUMBER_INTL = '+8801712906942'; // From project brief

    if (!window.shopCartModule) {
        console.error("shopCartModule not found. Ensure cart-module.js is loaded.");
        if (cartItemsContainer) cartItemsContainer.innerHTML = "<p>কার্ট লোড করতে সমস্যা হচ্ছে।</p>";
        return;
    }

    function renderCart() {
        const cart = window.shopCartModule.getCart();
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = ''; // Clear previous items or loading text

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">আপনার শপিং কার্ট এখন খালি। <a href="index.html">কেনাকাটা শুরু করুন!</a></p>';
            if (placeOrderButton) placeOrderButton.disabled = true;
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'cart-item';
                itemElement.dataset.productId = item.id;

                const itemSubtotal = (item.price * item.quantity).toLocaleString('bn-BD');
                const itemPriceFormatted = item.price.toLocaleString('bn-BD');

                itemElement.innerHTML = `
                    <div class="cart-item-image">
                        <img src="${item.imageUrl || 'assets/images/placeholder_product.png'}" alt="${item.name}">
                    </div>
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p class="item-price">একক মূল্য: ${itemPriceFormatted}৳</p>
                        <div class="quantity-controls">
                            <button class="quantity-decrease" data-id="${item.id}">-</button>
                            <span class="quantity-display">${item.quantity.toLocaleString('bn-BD')}</span>
                            <button class="quantity-increase" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <p class="item-total-price">মোট: ${itemSubtotal}৳</p>
                        <button class="remove-item-btn" data-id="${item.id}">সরিয়ে ফেলুন</button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
            if (placeOrderButton) placeOrderButton.disabled = false;
        }
        updateCartSummary(cart);
        attachCartItemEventListeners();
    }

    function updateCartSummary(cart) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (totalItemsCountElement) totalItemsCountElement.textContent = totalItems.toLocaleString('bn-BD');
        if (totalCartPriceElement) totalCartPriceElement.textContent = `${totalPrice.toLocaleString('bn-BD')}৳`;
    }

    function attachCartItemEventListeners() {
        cartItemsContainer.querySelectorAll('.quantity-decrease').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.id;
                const cart = window.shopCartModule.getCart();
                const item = cart.find(p => p.id === productId);
                if (item && item.quantity > 1) {
                    window.shopCartModule.updateItemQuantity(productId, item.quantity - 1);
                } else if (item && item.quantity === 1) { // Optional: confirm removal or just remove
                    window.shopCartModule.removeItemFromCart(productId);
                }
                renderCart(); // Re-render the entire cart
            });
        });

        cartItemsContainer.querySelectorAll('.quantity-increase').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.id;
                window.shopCartModule.updateItemQuantity(productId, (window.shopCartModule.getCart().find(p=>p.id===productId)?.quantity || 0) + 1);
                renderCart();
            });
        });

        cartItemsContainer.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.id;
                window.shopCartModule.removeItemFromCart(productId);
                renderCart();
            });
        });
    }

    async function handlePlaceOrder() {
        if (placeOrderButton) placeOrderButton.disabled = true;
        if (locationStatusMsgElement) locationStatusMsgElement.textContent = 'অবস্থান পরীক্ষা করা হচ্ছে...';

        const locationData = await getRequiredLocation();

        if (!locationData.granted) {
            if (placeOrderButton) placeOrderButton.disabled = false;
            return; // Stop order process if location not granted
        }
        
        const customerName = customerNameInput ? customerNameInput.value.trim() : "";
        const customerPhone = customerPhoneInput ? customerPhoneInput.value.trim() : "";
        const mapsLink = `https://www.google.com/maps?q=LATITUDE,LONGITUDE`;
        
        const message = window.shopCartModule.generateWhatsAppOrderMessage(customerName, customerPhone, mapsLink);
        const whatsappUrl = `https://wa.me/${SHOP_PHONE_NUMBER_INTL}?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
        
        // Optionally clear cart after attempting to place order
        // window.shopCartModule.clearCart();
        // renderCart(); 
        // alert("আপনার অর্ডার হোয়াটসঅ্যাপে পাঠানো হয়েছে। শীঘ্রই আপনার সাথে যোগাযোগ করা হবে।");
        
        if (placeOrderButton) placeOrderButton.disabled = false; // Re-enable after processing
    }

    function getRequiredLocation() {
        return new Promise((resolve) => {
            if (navigator.geolocation) {
                // Check localStorage first, similar to main.js logic but more direct for this flow
                const permissionStatus = localStorage.getItem('shopUserLocationPermission');

                if (permissionStatus === 'granted') {
                    if (locationStatusMsgElement) locationStatusMsgElement.textContent = 'অবস্থান পাওয়া যাচ্ছে...';
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            if (locationStatusMsgElement) locationStatusMsgElement.textContent = 'অবস্থান সফলভাবে গৃহীত।';
                            resolve({ granted: true, latitude: position.coords.latitude, longitude: position.coords.longitude });
                        },
                        (error) => {
                            console.warn("Error getting location even after grant: ", error.message);
                            if (locationStatusMsgElement) locationStatusMsgElement.textContent = `অবস্থান পেতে সমস্যা: ${error.message}`;
                            // Fallback: allow proceeding without precise link, but mark as issue
                            resolve({ granted: true, latitude: null, longitude: null, error: error.message }); 
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    );
                    return;
                }
                
                // If not granted, or denied temporarily, show our modal
                if (locationModal && grantLocationModalBtn && closeLocationModalBtn && locationStatusMsgElement) {
                    locationModal.style.display = 'flex';
                    locationStatusMsgElement.textContent = 'অর্ডারের জন্য আপনার অবস্থান প্রয়োজন।';

                    grantLocationModalBtn.onclick = () => { // Use onclick to easily replace previous if any
                        locationStatusMsgElement.textContent = 'অবস্থানের অনুমতির জন্য অনুরোধ করা হচ্ছে...';
                        navigator.geolocation.getCurrentPosition(
                            (position) => {
                                localStorage.setItem('shopUserLocationPermission', 'granted');
                                locationModal.style.display = 'none';
                                resolve({ granted: true, latitude: position.coords.latitude, longitude: position.coords.longitude });
                            },
                            (error) => {
                                localStorage.setItem('shopUserLocationPermission', 'denied_persistent_cart'); // Specific denial context
                                locationStatusMsgElement.textContent = `অবস্থানের অনুমতি দেওয়া হয়নি। ${error.message}`;
                                // Do not resolve with granted true here, keep modal open or let user close
                                // To stop order, resolve({ granted: false });
                                // For now, let user close modal, order button will re-trigger
                            },
                            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
                        );
                    };
                    closeLocationModalBtn.onclick = () => {
                        locationModal.style.display = 'none';
                        locationStatusMsgElement.textContent = 'অবস্থানের অনুমতি বাতিল করা হয়েছে।';
                        resolve({ granted: false }); // User cancelled from modal
                    };
                } else {
                     console.error("Location permission modal elements not found.");
                     alert("অবস্থান অনুমতির জন্য UI উপাদান খুঁজে পাওয়া যায়নি।");
                     resolve({ granted: false });
                }

            } else {
                alert("দুঃখিত, আপনার ব্রাউজারে লোকেশন সার্ভিস পাওয়া যায়নি।");
                resolve({ granted: false });
            }
        });
    }


    if (placeOrderButton) {
        placeOrderButton.addEventListener('click', handlePlaceOrder);
    }

    // Listen for cart updates from other sources (e.g., if another tab modifies localStorage)
    // Or from our own shopCartModule's dispatched event
    window.addEventListener('storage', (event) => {
        if (event.key === 'shoppingCart') {
            renderCart();
        }
    });
    window.addEventListener('cartUpdated', () => {
        renderCart();
    });

    // Initial render
    renderCart();
});