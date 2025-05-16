// Filename: assets/js/category-brand-filter.js
document.addEventListener('DOMContentLoaded', async () => {
    const filterBrandButtonElement = document.getElementById('filter-brand-btn');
    const productGridElementOnCategoryPage = document.getElementById('product-grid'); // Grid managed by category-loader or this script
    const searchInputElementOnCategoryPage = document.getElementById('product-search');
    const priceSortElementOnCategoryPage = document.getElementById('price-sort');

    if (!filterBrandButtonElement || !productGridElementOnCategoryPage || !searchInputElementOnCategoryPage || !priceSortElementOnCategoryPage) {
        // console.warn("Required elements for brand filter not found on category page.");
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const categoryNameFromURL = params.get('category') ? decodeURIComponent(params.get('category')) : null;

    if (!categoryNameFromURL) return; // Should be handled by category-loader.js already

    // Product data file paths (must be consistent with other loaders)
    const PRODUCT_DATA_FILES_FOR_FILTER = [
        'assets/js/data/cosmetics_data.js',
        // ... add all other data files
    ];

    let allProductsForFilter = [];
    let baseCategoryProducts = []; // Products belonging to the current category, before any brand/search/sort by this script
    let availableBrandsInCategory = [];
    let selectedBrands = []; // Array to store currently selected brands for filtering

    // Ensure shared modules are loaded
    if (!window.sharedDataLoader || !window.shopCartModule) {
        console.error("Shared modules (sharedDataLoader or shopCartModule) not found for category-brand-filter.js.");
        return;
    }

    // Load all product data using the shared loader
    allProductsForFilter = await window.sharedDataLoader.loadAllShopProducts(PRODUCT_DATA_FILES_FOR_FILTER);
    
    if (allProductsForFilter.length > 0) {
        baseCategoryProducts = allProductsForFilter.filter(
            product => product.categoryName === categoryNameFromURL
        );
        const brandsSet = new Set(baseCategoryProducts.map(p => p.brandName).filter(b => b)); // Filter out undefined/null brands
        availableBrandsInCategory = Array.from(brandsSet).sort((a, b) => a.localeCompare(b, 'bn-BD'));
    }

    filterBrandButtonElement.addEventListener('click', showBrandFilterPopup);

    function showBrandFilterPopup() {
        // Remove existing popup if any
        const existingPopup = document.getElementById('brandFilterPopup');
        if (existingPopup) existingPopup.remove();

        const popupOverlay = document.createElement('div');
        popupOverlay.id = 'brandFilterPopup';
        popupOverlay.className = 'filter-popup-overlay';

        let brandListHTML = '';
        if (availableBrandsInCategory.length > 0) {
            brandListHTML = availableBrandsInCategory.map(brand => `
                <li>
                    <label>
                        <input type="checkbox" name="brand" value="${brand}" ${selectedBrands.includes(brand) ? 'checked' : ''}>
                        ${brand}
                    </label>
                </li>
            `).join('');
        } else {
            brandListHTML = '<p class="no-brands-message">এই ক্যাটেগরিতে ফিল্টার করার জন্য কোনো ব্র্যান্ড নেই।</p>';
        }

        popupOverlay.innerHTML = `
            <div class="filter-popup-content">
                <span class="filter-popup-close" id="closeBrandFilterPopup">&times;</span>
                <h3>ব্র্যান্ড অনুযায়ী ফিল্টার করুন</h3>
                <ul class="brand-filter-list">
                    ${brandListHTML}
                </ul>
                <div class="filter-popup-actions">
                    <button class="clear-filters-btn" id="clearBrandFiltersBtn" ${availableBrandsInCategory.length === 0 ? 'disabled' : ''}>ফিল্টার মুছুন</button>
                    <button class="apply-filters-btn" id="applyBrandFiltersBtn" ${availableBrandsInCategory.length === 0 ? 'disabled' : ''}>ফিল্টার প্রয়োগ করুন</button>
                </div>
            </div>
        `;
        document.body.appendChild(popupOverlay);
        popupOverlay.style.display = 'flex';

        document.getElementById('closeBrandFilterPopup').addEventListener('click', () => {
            popupOverlay.style.display = 'none';
            if (popupOverlay.parentElement) popupOverlay.parentElement.removeChild(popupOverlay);
        });
        
        if (availableBrandsInCategory.length > 0) {
            document.getElementById('applyBrandFiltersBtn').addEventListener('click', () => {
                const checkboxes = popupOverlay.querySelectorAll('input[name="brand"]:checked');
                selectedBrands = Array.from(checkboxes).map(cb => cb.value);
                applyFiltersAndRender();
                popupOverlay.style.display = 'none';
                if (popupOverlay.parentElement) popupOverlay.parentElement.removeChild(popupOverlay);
            });

            document.getElementById('clearBrandFiltersBtn').addEventListener('click', () => {
                selectedBrands = [];
                // Uncheck all checkboxes
                popupOverlay.querySelectorAll('input[name="brand"]:checked').forEach(cb => cb.checked = false);
                applyFiltersAndRender(); // Re-render with cleared brand filters
                popupOverlay.style.display = 'none';
                if (popupOverlay.parentElement) popupOverlay.parentElement.removeChild(popupOverlay);
            });
        }
    }

    function applyFiltersAndRender() {
        let productsToDisplay = [...baseCategoryProducts];

        // 1. Apply Brand Filter (if any brands are selected)
        if (selectedBrands.length > 0) {
            productsToDisplay = productsToDisplay.filter(product => selectedBrands.includes(product.brandName));
        }

        // 2. Apply Search Term (read from existing search input)
        const searchTerm = searchInputElementOnCategoryPage.value.toLowerCase().trim();
        if (searchTerm) {
            productsToDisplay = productsToDisplay.filter(product =>
                (product.name && product.name.toLowerCase().includes(searchTerm)) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.brandName && product.brandName.toLowerCase().includes(searchTerm)) // Search brandName also
            );
        }

        // 3. Apply Sort Order (read from existing sort select)
        const sortType = priceSortElementOnCategoryPage.value;
        switch (sortType) {
            case 'price-asc': productsToDisplay.sort((a, b) => a.price - b.price); break;
            case 'price-desc': productsToDisplay.sort((a, b) => b.price - a.price); break;
            case 'name-asc': productsToDisplay.sort((a, b) => a.name.localeCompare(b.name, 'bn-BD')); break;
            case 'name-desc': productsToDisplay.sort((a, b) => b.name.localeCompare(a.name, 'bn-BD')); break;
        }
        
        // Re-render the product grid using this script's own render function
        renderProductsByBrandFilter(productsToDisplay);
    }
    
    // This render function is specific to this filter script.
    // It directly manipulates the product grid.
    function renderProductsByBrandFilter(productsToRender) {
        if (!productGridElementOnCategoryPage) return;
        productGridElementOnCategoryPage.innerHTML = ''; // Clear previous products

        if (productsToRender.length === 0) {
            let message = "এই ফিল্টার মানদণ্ডে কোনো পণ্য পাওয়া যায়নি।";
            if (baseCategoryProducts.length === 0 && allProductsForFilter.length > 0) {
                message = `এই "${categoryNameFromURL}" ক্যাটেগরিতে কোনো পণ্য নেই।`;
            } else if (allProductsForFilter.length === 0 && PRODUCT_DATA_FILES_FOR_FILTER.length > 0) {
                 message = `পণ্য ডেটা লোড করা যায়নি বা খালি।`;
            }
            productGridElementOnCategoryPage.innerHTML = `<p style="text-align:center; padding: 20px;">${message}</p>`;
            return;
        }

        productsToRender.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card'; // Use same class as category-loader for styling consistency
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
                <button class="add-to-cart-btn" data-product-id="${product.id}">কার্টে যোগ করুন</button>
            `;
            productGridElementOnCategoryPage.appendChild(productCard);
        });

        // Add event listeners to new "Add to Cart" buttons (using shared cart module)
        productGridElementOnCategoryPage.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                // Pass the currently loaded 'allProductsForFilter' list for product detail lookup by cart module
                const success = window.shopCartModule.addToCart(productId, allProductsForFilter); 
                if (success) {
                    event.target.textContent = 'যোগ করা হয়েছে!';
                    event.target.style.backgroundColor = '#28a745';
                    setTimeout(() => {
                        event.target.textContent = 'কার্টে যোগ করুন';
                        event.target.style.backgroundColor = ''; 
                    }, 1500);
                } else {
                    event.target.textContent = 'ব্যর্থ হয়েছে!';
                    event.target.style.backgroundColor = '#dc3545';
                     setTimeout(() => {
                        event.target.textContent = 'কার্টে যোগ করুন';
                        event.target.style.backgroundColor = ''; 
                    }, 2000);
                }
            });
        });
    }

    // Listen to original search and sort inputs to re-apply filters if they change
    // This ensures that if a brand filter is active, search/sort will consider it.
    if (searchInputElementOnCategoryPage) {
        searchInputElementOnCategoryPage.addEventListener('input', () => {
            // Only re-apply if a brand filter might be active or to maintain consistent behavior
            if (selectedBrands.length > 0 || baseCategoryProducts.length > 0) {
                 applyFiltersAndRender();
            }
        });
    }
    if (priceSortElementOnCategoryPage) {
        priceSortElementOnCategoryPage.addEventListener('change', () => {
            if (selectedBrands.length > 0 || baseCategoryProducts.length > 0) {
                applyFiltersAndRender();
            }
        });
    }
    
    // Initial render in case category-loader.js hasn't run or to establish a baseline
    // This might cause a flash if category-loader.js also renders.
    // However, this script will take over if brand filters are used.
    // To prevent double rendering if category-loader.js already did the job,
    // we only do an initial active render if that script is *not* present or if needed.
    // For now, this script will always try to render based on its own data and filters.
    // applyFiltersAndRender(); // Call it once all data is ready to show initial state (all brands selected by default if none chosen)

});