// Filename: assets/js/category-loader.js
document.addEventListener('DOMContentLoaded', () => {
    const categoryTitleElement = document.getElementById('category-title');
    const productGridElement = document.getElementById('product-grid');
    const searchInputElement = document.getElementById('product-search');
    const priceSortElement = document.getElementById('price-sort');
    const filterBrandButton = document.getElementById('filter-brand-btn');

    const params = new URLSearchParams(window.location.search);
    const categoryNameFromURL = params.get('category') ? decodeURIComponent(params.get('category')) : null;

    if (!categoryNameFromURL) {
        if (categoryTitleElement) categoryTitleElement.textContent = 'ক্যাটেগরি নির্দিষ্ট করা হয়নি';
        if (productGridElement) productGridElement.innerHTML = '<p>অনুগ্রহ করে একটি ক্যাটেগরি নির্বাচন করুন।</p>';
        return;
    }

    if (categoryTitleElement) categoryTitleElement.textContent = `${categoryNameFromURL}`;
    document.title = `${categoryNameFromURL} - ডিজিটাল দোকান`;

    // --- Independent Data Loading for category-loader.js ---
    const C_LOADER_BRAND_META_DATA = window.brandMetaDataStore || {}; // Assumes brand_metadata.js loaded globally
    const C_LOADER_PRODUCT_DATA_FILES = [
        'assets/js/data/cosmetics_data.js', // Add all your data files here
        // 'assets/js/data/grocery_data.js',
        // 'assets/js/data/snacks_data.js',
    ];
    
    let cLoaderAllProducts = [];
    let cLoaderDataFilesLoadedCount = 0;
    let cLoaderDataLoadInitiated = false;
    let originalProductsForCategory = []; // To store the unfiltered, unsorted products of the current category

    // Define registerProducts within this script's scope if data files expect it on window
    // This might conflict if main.js also defines it and both run on the same page.
    // A safer way: data files should just define arrays, and this script fetches and parses them.
    // For now, assuming data files like cosmetics_data.js assign to a known variable or we adapt.
    // Let's modify the loading to assume data files define a variable (e.g., `cosmetics_products_list`)

    async function loadCategoryProductData() {
        cLoaderDataLoadInitiated = true;
        if (C_LOADER_PRODUCT_DATA_FILES.length === 0) {
            processCategoryData(); return;
        }

        for (const filePath of C_LOADER_PRODUCT_DATA_FILES) {
            try {
                // This is a simplified fetch for JS files that define a global-like variable
                // e.g. cosmetics_data.js defines 'cosmetics_products_list'
                // This is NOT robust for complex scripts.
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = filePath;
                    script.onload = () => {
                        // Try to access the data defined by the script
                        // This relies on a convention for variable names in data files
                        const fileName = filePath.split('/').pop().split('.')[0]; // e.g., "cosmetics_data"
                        const dataListName = `${fileName.split('_')[0]}_products_list`; // e.g., "cosmetics_products_list"
                        
                        if (window[dataListName] && Array.isArray(window[dataListName])) {
                            window[dataListName].forEach(p => {
                                cLoaderAllProducts.push({...p});
                            });
                        } else {
                            console.warn(`Data variable ${dataListName} not found or not an array after loading ${filePath}`);
                        }
                        cLoaderDataFilesLoadedCount++;
                        resolve();
                    };
                    script.onerror = () => {
                        console.error(`Error loading script: ${filePath}`);
                        cLoaderDataFilesLoadedCount++; // Count error to not hang
                        reject();
                    };
                    document.head.appendChild(script);
                });
            } catch (error) {
                // Handled by onerror or if promise rejected
            }
        }
        // Check if all attempted loads are done (success or error)
        if (cLoaderDataFilesLoadedCount === C_LOADER_PRODUCT_DATA_FILES.length) {
            processCategoryData();
        }
    }
    
    function processCategoryData() {
        originalProductsForCategory = cLoaderAllProducts.filter(
            product => product.categoryName === categoryNameFromURL
        );
        if (productGridElement && originalProductsForCategory.length === 0 && cLoaderAllProducts.length > 0) {
             productGridElement.innerHTML = `<p style="text-align:center; padding: 20px;">এই "${categoryNameFromURL}" ক্যাটেগরিতে কোনো পণ্য পাওয়া যায়নি।</p>`;
        } else if (productGridElement && cLoaderAllProducts.length === 0 && cLoaderDataLoadInitiated) {
            productGridElement.innerHTML = `<p style="text-align:center; padding: 20px;"> কোনো পণ্য ডেটা খুঁজে পাওয়া যায়নি।</p>`;
        }
        renderProducts(originalProductsForCategory); // Initial render
        setupEventListeners(originalProductsForCategory);
    }

    // --- Render, AddToCart, Event Listeners (largely same as previous category-loader.js) ---
    function renderProducts(productsToRender) {
        if (!productGridElement) return;
        productGridElement.innerHTML = ''; 

        if (productsToRender.length === 0) {
            productGridElement.innerHTML = '<p style="text-align:center; padding: 20px;">এই মানদণ্ডে কোনো পণ্য নেই।</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            const imageUrl = product.imageUrl || 'assets/images/placeholder_product.png';

            productCard.innerHTML = `
                <a href="product-detail.html?id=${product.id}" class="product-link">
                    <div class="product-image-container">
                        <img src="${imageUrl}" alt="${product.name}" class="product-image">
                    </div>
                    <h3 class="product-name">${product.name}</h3>
                </a>
                <p class="product-price">মূল্য: ${product.price.toLocaleString('bn-BD')}৳</p>
                <p class="product-brand" style="font-size:0.85em; color:#555; margin-bottom:8px;">ব্র্যান্ড: ${product.brandName || 'N/A'}</p>
                <button class="add-to-cart-btn" data-product-id="${product.id}" data-product-name="${product.name}">কার্টে যোগ করুন</button>
            `;
            productGridElement.appendChild(productCard);
        });

        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });
    }

    function handleAddToCart(event) {
        const productId = event.target.dataset.productId;
        const productName = event.target.dataset.productName;
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === productId);

        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity += 1;
        } else {
            const productDetails = cLoaderAllProducts.find(p => p.id === productId); // Use products loaded by this script
            if (productDetails) {
                 cart.push({ 
                    id: productId, 
                    name: productDetails.name, 
                    price: productDetails.price,
                    imageUrl: productDetails.imageUrl,
                    brandName: productDetails.brandName, // Store brandName as well
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
        // Update global cart icon/count if main.js provides a function, otherwise local only for now
    }
    
    function setupEventListeners(productsForCategory) {
        let currentDisplayableProducts = [...productsForCategory];

        if (searchInputElement) {
            searchInputElement.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase().trim();
                const filtered = productsForCategory.filter(product => 
                    (product.name && product.name.toLowerCase().includes(searchTerm)) ||
                    (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                    (product.brandName && product.brandName.toLowerCase().includes(searchTerm))
                );
                currentDisplayableProducts = [...filtered];
                applySortAndRender(currentDisplayableProducts, priceSortElement.value);
            });
        }

        if (priceSortElement) {
            priceSortElement.addEventListener('change', (e) => {
                const sortType = e.target.value;
                applySortAndRender(currentDisplayableProducts, sortType);
            });
        }
        
        if (filterBrandButton) {
            filterBrandButton.addEventListener('click', () => {
                alert('ব্র্যান্ড অনুযায়ী ফিল্টার করার সুবিধা শীঘ্রই আসছে!');
            });
        }
    }

    function applySortAndRender(productsToSort, sortType) {
        let sortedProducts = [...productsToSort];
        switch(sortType) {
            case 'price-asc': sortedProducts.sort((a, b) => a.price - b.price); break;
            case 'price-desc': sortedProducts.sort((a, b) => b.price - a.price); break;
            case 'name-asc': sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'bn-BD')); break;
            case 'name-desc': sortedProducts.sort((a, b) => b.name.localeCompare(a.name, 'bn-BD')); break;
        }
        renderProducts(sortedProducts);
    }

    // Start data loading for this page
    loadCategoryProductData();
});