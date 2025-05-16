// Filename: assets/js/brand-loader.js
document.addEventListener('DOMContentLoaded', async () => {
    const brandTitleElement = document.getElementById('brand-title');
    const brandHeaderInfoElement = document.getElementById('brand-header-info');
    const brandProductsContainer = document.getElementById('brand-products-container');

    const params = new URLSearchParams(window.location.search);
    const brandNameFromURL = params.get('brand') ? decodeURIComponent(params.get('brand')) : null;

    // Defined in brand_metadata.js
    const BRAND_META_DATA_STORE = window.brandMetaDataStore || {};
    // Product data file paths (same as other loaders that need all products)
    const PRODUCT_DATA_FILES = [
        'assets/js/data/cosmetics_data.js',
        'assets/js/data/grocery_data.js',    // <-- Add this line
        'assets/js/data/snacks_data.js',      // <-- Add this line
        // ... any other existing data files ...
    ];
    // Predefined category display order for brand page
    const CATEGORY_DISPLAY_ORDER = [
        "কসমেটিকস", "গ্রোসারি আইটেম", "স্ন্যাকস", "ফ্রেশ ভেজিটেবলস", 
        "স্যানিটারি আইটেম", "ইলেকট্রনিকস", "বেবি আইটেম", "স্টেশনারি"
    ];


    if (!brandNameFromURL) {
        if (brandTitleElement) brandTitleElement.textContent = 'ব্র্যান্ড নির্দিষ্ট করা হয়নি';
        if (brandProductsContainer) brandProductsContainer.innerHTML = '<p>অনুগ্রহ করে একটি ব্র্যান্ড নির্বাচন করুন।</p>';
        return;
    }

    // Set brand title and page title early
    if (brandTitleElement) brandTitleElement.textContent = `${brandNameFromURL}`;
    document.title = `${brandNameFromURL} - ব্র্যান্ডের পণ্য - ডিজিটাল দোকান`;

    // Display brand logo if available
    if (brandHeaderInfoElement && BRAND_META_DATA_STORE[brandNameFromURL] && BRAND_META_DATA_STORE[brandNameFromURL].logo) {
        const logoImg = document.createElement('img');
        logoImg.src = BRAND_META_DATA_STORE[brandNameFromURL].logo;
        logoImg.alt = `${brandNameFromURL} লোগো`;
        logoImg.className = 'brand-logo-large';
        // Prepend logo before the h1 title, or adjust layout as needed
        brandHeaderInfoElement.insertBefore(logoImg, brandTitleElement);
    }


    // Load all products using the shared loader
    // Ensure shared-data-loader.js is loaded before this script
    if (!window.sharedDataLoader || !window.shopCartModule) {
        console.error("Shared modules (sharedDataLoader or shopCartModule) not found. Ensure they are loaded before brand-loader.js");
        if (brandProductsContainer) brandProductsContainer.innerHTML = '<p>পৃষ্ঠা লোড করতে একটি ত্রুটি ঘটেছে।</p>';
        return;
    }
    
    const allProducts = await window.sharedDataLoader.loadAllShopProducts(PRODUCT_DATA_FILES);

    if (!allProducts || allProducts.length === 0) {
        if (brandProductsContainer) brandProductsContainer.innerHTML = '<p>কোনো পণ্য ডেটা খুঁজে পাওয়া যায়নি।</p>';
        return;
    }

    const productsOfThisBrand = allProducts.filter(p => p.brandName === brandNameFromURL);

    if (productsOfThisBrand.length === 0) {
        if (brandProductsContainer) brandProductsContainer.innerHTML = `<p>"${brandNameFromURL}" ব্র্যান্ডের কোনো পণ্য পাওয়া যায়নি।</p>`;
        return;
    }

    // Group products by category
    const productsByCategory = productsOfThisBrand.reduce((acc, product) => {
        const category = product.categoryName || "অন্যান্য"; // Fallback category
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});

    renderBrandProducts(productsByCategory);

    function renderBrandProducts(categorizedProducts) {
        if (!brandProductsContainer) return;
        brandProductsContainer.innerHTML = ''; // Clear loading text

        let contentRendered = false;

        CATEGORY_DISPLAY_ORDER.forEach(categoryName => {
            if (categorizedProducts[categoryName] && categorizedProducts[categoryName].length > 0) {
                contentRendered = true;
                const categoryGroupDiv = document.createElement('div');
                categoryGroupDiv.className = 'category-group-on-brand-page';
                
                const groupTitle = document.createElement('h3');
                groupTitle.className = 'category-group-title';
                groupTitle.textContent = categoryName;
                categoryGroupDiv.appendChild(groupTitle);

                const productGridDiv = document.createElement('div');
                // Re-use .items-grid and .product-card styles if defined in main.css or category-page.css
                productGridDiv.className = 'items-grid brand-product-grid'; 
                
                categorizedProducts[categoryName].forEach(product => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card'; // Assuming .product-card styles are globally available or in linked CSS
                    const imageUrl = product.imageUrl || 'assets/images/placeholder_product.png';

                    productCard.innerHTML = `
                        <a href="product-detail.html?id=${product.id}" class="product-link">
                            <div class="product-image-container">
                                <img src="${imageUrl}" alt="${product.name}" class="product-image">
                            </div>
                            <h4 class="product-name">${product.name}</h4>
                        </a>
                        <p class="product-price">মূল্য: ${product.price.toLocaleString('bn-BD')}৳</p>
                        <button class="add-to-cart-btn" data-product-id="${product.id}">কার্টে যোগ করুন</button>
                    `;
                    productGridDiv.appendChild(productCard);
                });
                categoryGroupDiv.appendChild(productGridDiv);
                brandProductsContainer.appendChild(categoryGroupDiv);
            }
        });

        if (!contentRendered) {
            brandProductsContainer.innerHTML = `<p>"${brandNameFromURL}" ব্র্যান্ডের কোনো পণ্য এই ক্যাটেগরিগুলোতে পাওয়া যায়নি।</p>`;
        }

        // Add event listeners to new "Add to Cart" buttons
        document.querySelectorAll('#brand-products-container .add-to-cart-btn').forEach(button => {
            button.addEventListener('click', (event) => {
                const productId = event.target.dataset.productId;
                const success = window.shopCartModule.addToCart(productId, allProducts); // Pass allProducts for detail lookup
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
                }
            });
        });
    }
});