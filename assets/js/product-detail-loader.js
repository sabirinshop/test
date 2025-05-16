// Filename: assets/js/product-detail-loader.js
document.addEventListener('DOMContentLoaded', () => {
    const productDetailContainer = document.getElementById('product-detail-container');
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');

    if (!productId) {
        if (productDetailContainer) productDetailContainer.innerHTML = '<p class="loading-text">পণ্যের আইডি নির্দিষ্ট করা হয়নি।</p>';
        document.title = "ত্রুটি - ডিজিটাল দোকান";
        return;
    }

    // --- Independent Data Loading for product-detail-loader.js ---
    const PD_LOADER_BRAND_META_DATA = window.brandMetaDataStore || {}; // Assumes brand_metadata.js loaded globally
    const PD_LOADER_PRODUCT_DATA_FILES = [
        'assets/js/data/cosmetics_data.js', // Add all your data files here
        // 'assets/js/data/grocery_data.js',
        // 'assets/js/data/snacks_data.js',
    ];
    
    let pdLoaderAllProducts = [];
    let pdLoaderDataFilesLoadedCount = 0;
    let pdLoaderDataLoadInitiated = false;

    async function loadProductDetailData() {
        pdLoaderDataLoadInitiated = true;
        if (PD_LOADER_PRODUCT_DATA_FILES.length === 0) {
            findAndDisplayProduct(); return;
        }

        for (const filePath of PD_LOADER_PRODUCT_DATA_FILES) {
            try {
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = filePath;
                    script.onload = () => {
                        const fileName = filePath.split('/').pop().split('.')[0];
                        const dataListName = `${fileName.split('_')[0]}_products_list`;
                        if (window[dataListName] && Array.isArray(window[dataListName])) {
                            window[dataListName].forEach(p => pdLoaderAllProducts.push({...p}));
                        } else {
                            console.warn(`PD: Data variable ${dataListName} not found or not an array after loading ${filePath}`);
                        }
                        pdLoaderDataFilesLoadedCount++;
                        resolve();
                    };
                    script.onerror = () => {
                        console.error(`PD: Error loading script: ${filePath}`);
                        pdLoaderDataFilesLoadedCount++;
                        reject();
                    };
                    document.head.appendChild(script);
                });
            } catch (error) { /* Handled */ }
        }
        if (pdLoaderDataFilesLoadedCount === PD_LOADER_PRODUCT_DATA_FILES.length) {
            findAndDisplayProduct();
        }
    }
    
    function findAndDisplayProduct() {
        const product = pdLoaderAllProducts.find(p => p.id === productId);

        if (product) {
            document.title = `${product.name} - ডিজিটাল দোকান`;
            renderProductDetails(product);
        } else {
            if (productDetailContainer) {
                 if (pdLoaderAllProducts.length > 0 && pdLoaderDataLoadInitiated) {
                    productDetailContainer.innerHTML = '<p class="loading-text">দুঃখিত, এই পণ্যটি খুঁজে পাওয়া যায়নি।</p>';
                 } else if (!pdLoaderDataLoadInitiated) {
                    productDetailContainer.innerHTML = '<p class="loading-text">পণ্য তথ্য লোড হচ্ছে...</p>';
                     // This case might need a retry if scripts didn't load fast enough before DOMContentLoaded
                 } else {
                    productDetailContainer.innerHTML = '<p class="loading-text">কোনো পণ্য তথ্য লোড করা হয়নি।</p>';
                 }
            }
            console.warn(`Product with ID ${productId} not found.`);
        }
    }

    function renderProductDetails(product) {
        if (!productDetailContainer) return;

        const shopPhoneNumberIntl = '+8801712906942'; // From project requirements
        const imageUrl = product.imageUrl || 'assets/images/placeholder_product.png';
        const stockStatusText = product.stockCount > 0 ? `অবশিষ্ট ${product.stockCount.toLocaleString('bn-BD')}টি` : "স্টকে নেই";
        const stockStatusClass = product.stockCount > 0 ? '' : 'out-of-stock';

        let actionButtonHTML;
        if (product.stockCount > 0) {
            actionButtonHTML = `<button class="product-action-button add-to-cart" data-product-id="${product.id}" data-product-name="${product.name}">কার্টে যোগ করুন</button>`;
        } else {
            const inquiryMessage = encodeURIComponent(`এই "${product.name}" পণ্যটি কি এখন পাওয়া যাবে?`);
            actionButtonHTML = `<a href="https://wa.me/${shopPhoneNumberIntl}?text=${inquiryMessage}" target="_blank" class="product-action-button whatsapp-inquiry">হোয়াটসঅ্যাপে জিজ্ঞাসা করুন</a>`;
        }

        productDetailContainer.innerHTML = `
            <div class="product-layout">
                <div class="product-image-gallery">
                    <img src="${imageUrl}" alt="${product.name}" class="product-main-image">
                </div>
                <div class="product-info">
                    <h1 class="product-title-detail">${product.name}</h1>
                    <p class="product-brand-detail">ব্র্যান্ড: <a href="brand.html?brand=${encodeURIComponent(product.brandName || '')}">${product.brandName || 'N/A'}</a></p>
                    <p class="product-price-detail">মূল্য: ${product.price.toLocaleString('bn-BD')}৳</p>
                    <p class="product-stock-detail ${stockStatusClass}">${stockStatusText}</p>
                    
                    ${actionButtonHTML}

                    <div class="product-description-detail">
                        <h3>পণ্যের বিবরণ</h3>
                        <p>${product.description || 'কোনো বিবরণ নেই।'}</p>
                    </div>
                </div>
            </div>
        `;

        if (product.stockCount > 0) {
            const addToCartButton = productDetailContainer.querySelector('.add-to-cart');
            if (addToCartButton) {
                addToCartButton.addEventListener('click', handleAddToCartOnDetail);
            }
        }
    }

    function handleAddToCartOnDetail(event) { // Self-contained Add to Cart logic
        const productId = event.target.dataset.productId;
        const productName = event.target.dataset.productName;
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === productId);

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            const productDetails = pdLoaderAllProducts.find(p => p.id === productId);
            if (productDetails) {
                 cart.push({ 
                    id: productId, 
                    name: productDetails.name, 
                    price: productDetails.price,
                    imageUrl: productDetails.imageUrl,
                    brandName: productDetails.brandName,
                    quantity: 1 
                });
            } else {
                cart.push({ id: productId, name: productName, quantity: 1}); // Fallback
            }
        }
        localStorage.setItem('shoppingCart', JSON.stringify(cart));
        event.target.textContent = 'যোগ করা হয়েছে!';
        event.target.style.backgroundColor = '#28a745';
        setTimeout(() => {
            event.target.textContent = 'কার্টে যোগ করুন';
            event.target.style.backgroundColor = ''; 
        }, 1500);
        // Potentially update a global cart counter if such a function exists and is safe to call
    }

    // Start data loading for this page
    loadProductDetailData();
});