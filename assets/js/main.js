document.addEventListener('DOMContentLoaded', () => {
    const mainNav = document.getElementById('mainNav');
    const hamburgerMenu = document.querySelector('.hamburger-menu-placeholder');
    const contactLink = document.getElementById('contactLink');
    const contactPopup = document.getElementById('contactPopup');
    const closePopupButton = document.querySelector('#contactPopup .popup-close');

    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            const isNavOpen = mainNav.style.display === 'block';
            mainNav.style.display = isNavOpen ? 'none' : 'block';
        });
    }
    if (contactLink) {
        contactLink.addEventListener('click', (event) => {
            event.preventDefault();
            if (contactPopup) contactPopup.style.display = 'flex';
            if (mainNav.style.display === 'block') mainNav.style.display = 'none';
        });
    }
    if (closePopupButton) {
        closePopupButton.addEventListener('click', () => {
            if (contactPopup) contactPopup.style.display = 'none';
        });
    }
    if (contactPopup) {
        contactPopup.addEventListener('click', (event) => {
            if (event.target === contactPopup) { // Clicked on overlay only
                contactPopup.style.display = 'none';
            }
        });
    }

    const fbContactButton = document.getElementById('fbContact');
    const imoContactButton = document.getElementById('imoContact');
    const waContactButton = document.getElementById('waContact');
    const phoneContactButton = document.getElementById('phoneContact');
    const shopPhoneNumber = '01712906942';
    const shopPhoneNumberIntl = '+8801712906942';

    if (fbContactButton) fbContactButton.addEventListener('click', () => window.open('https://www.facebook.com/saberin.shop', '_blank'));
    if (imoContactButton) imoContactButton.addEventListener('click', () => alert(`ইমোতে যোগাযোগের জন্য ${shopPhoneNumber} নম্বরে মেসেজ করুন। বার্তার বিষয়: সাহায্য প্রয়োজন`));
    if (waContactButton) waContactButton.addEventListener('click', () => window.open(`https://wa.me/${shopPhoneNumberIntl}?text=${encodeURIComponent('সাহায্য প্রয়োজন')}`, '_blank'));
    if (phoneContactButton) phoneContactButton.addEventListener('click', () => window.location.href = `tel:${shopPhoneNumberIntl}`);
    
    const whatsappHelpButton = document.getElementById('whatsappHelpButton');
    if (whatsappHelpButton) {
        whatsappHelpButton.addEventListener('click', () => {
            const message = encodeURIComponent('আমি হোমপেজ থেকে সাহায্য চাইছি।');
            window.open(`https://wa.me/${shopPhoneNumberIntl}?text=${message}`, '_blank');
        });
    }

    const B_META_DATA = window.brandMetaDataStore || {};
    const productDataFiles = [
        'assets/js/data/cosmetics_data.js',
        'assets/js/data/grocery_data.js',    // <-- Add this line
        'assets/js/data/snacks_data.js',      // <-- Add this line
        // ... any other existing data files ...
    ];;
    let allProducts = [];
    let uniqueCategories = new Set();
    let uniqueBrands = new Set();
    let dataFilesLoadedCount = 0;
    let dataLoadInitiated = false;

    window.registerProducts = function(productsFromFile, categoryNameFromFile) {
        if (productsFromFile && Array.isArray(productsFromFile)) {
            productsFromFile.forEach(p => {
                const categoryName = p.categoryName || categoryNameFromFile;
                allProducts.push({...p, categoryName });
                if (categoryName) uniqueCategories.add(categoryName);
                if (p.brandName) uniqueBrands.add(p.brandName);
            });
        }
        dataFilesLoadedCount++;
        if (dataLoadInitiated && dataFilesLoadedCount === productDataFiles.length) {
            processAllData();
        }
    };
    
    async function loadAllDataScripts() {
        dataLoadInitiated = true;
        if (productDataFiles.length === 0) {
            processAllData(); return;
        }
        productDataFiles.forEach(filePath => {
            const script = document.createElement('script');
            script.src = filePath;
            script.async = true; // Async true is fine as registerProducts handles accumulation
            script.onerror = () => {
                console.error(`Error loading script: ${filePath}`);
                dataFilesLoadedCount++;
                if (dataFilesLoadedCount === productDataFiles.length) processAllData();
            };
            document.head.appendChild(script);
        });
    }

    function processAllData() {
        displayCategoriesOnHome(Array.from(uniqueCategories));
        displayBrandsOnHome(Array.from(uniqueBrands));
    }

    function displayCategoriesOnHome(categories) {
        const container = document.getElementById('categories-container');
        if (!container) return;
        container.innerHTML = ''; 

        if (categories.length === 0 && productDataFiles.length > 0) {
            // Only show "no categories" if data files were expected but yielded no categories
            container.innerHTML = '<p style="text-align:center; color: #777;">এখন কোনো ক্যাটেগরি নেই।</p>';
            return;
        }
         if (categories.length === 0 && productDataFiles.length === 0) {
            // No data files defined, so don't show "no categories" yet.
            container.innerHTML = '<p style="text-align:center; color: #777;">ক্যাটেগরি লোড হচ্ছে...</p>';
            return;
        }


        categories.forEach(categoryName => {
            const categoryElement = document.createElement('a');
            categoryElement.href = `category.html?category=${encodeURIComponent(categoryName)}`;
            categoryElement.className = 'category-item';
            const nameElement = document.createElement('span');
            nameElement.textContent = categoryName;
            // Placeholder for category icon:
            // const iconElement = document.createElement('img');
            // iconElement.src = `assets/images/category_icons/${categoryName.toLowerCase().replace(/\s+/g, '-')}.png`;
            // iconElement.alt = categoryName;
            // categoryElement.appendChild(iconElement);
            categoryElement.appendChild(nameElement);
            container.appendChild(categoryElement);
        });
    }

    function displayBrandsOnHome(brands) {
        const container = document.getElementById('brands-container');
        if (!container) return;
        container.innerHTML = '';

        if (brands.length === 0 && productDataFiles.length > 0) {
            container.innerHTML = '<p style="text-align:center; color: #777;">এখন কোনো ব্র্যান্ড নেই।</p>';
            return;
        }
         if (brands.length === 0 && productDataFiles.length === 0) {
            container.innerHTML = '<p style="text-align:center; color: #777;">ব্র্যান্ড লোড হচ্ছে...</p>';
            return;
        }
        
        brands.forEach(brandName => {
            const brandElement = document.createElement('a');
            brandElement.href = `brand.html?brand=${encodeURIComponent(brandName)}`;
            brandElement.className = 'brand-item';

            const brandMeta = B_META_DATA[brandName];
            if (brandMeta && brandMeta.logo) {
                const logoImg = document.createElement('img');
                logoImg.src = brandMeta.logo;
                logoImg.alt = brandName;
                brandElement.appendChild(logoImg);
            }
            
            const nameElement = document.createElement('span');
            nameElement.textContent = brandName;
            brandElement.appendChild(nameElement);
            container.appendChild(brandElement);
        });
    }
    
    const locationPermissionKey = 'shopUserLocationPermission';
    function requestUserLocation() {
        const permissionStatus = localStorage.getItem(locationPermissionKey);
        if (permissionStatus === 'granted' || permissionStatus === 'denied_persistent') return;
        if (window.location.protocol === 'file:' && !navigator.geolocation) console.warn('Geolocation API may be restricted under file:/// protocol.');
        showLocationPermissionPopup();
    }

    function showLocationPermissionPopup() {
        const popupId = 'customLocationPermissionPopup';
        if (document.getElementById(popupId)) return;

        const popup = document.createElement('div');
        popup.id = popupId;
        popup.className = 'popup-overlay';
        popup.style.display = 'flex';
        popup.innerHTML = `
            <div class="popup-content" style="max-width: 380px;">
                <span class="popup-close">&times;</span>
                <h3 style="margin-bottom: 10px;">অবস্থান অনুমতি</h3>
                <p style="margin-bottom: 20px; font-size: 0.9em; color: #555;">সঠিকভাবে আপনার অর্ডার পৌঁছে দিতে এবং উন্নত সেবা প্রদানের জন্য, আমরা আপনার বর্তমান অবস্থান জানতে চাই। আপনি কি আপনার অবস্থান জানাতে অনুমতি দেবেন?</p>
                <div style="display: flex; justify-content: space-around; gap: 10px;">
                    <button id="grantLocationBtn" style="background-color: #28a745; color:white; padding: 10px 15px; border:none; flex: 1;">অনুমতি দিন</button>
                    <button id="denyLocationBtn" style="background-color: #6c757d; color:white; padding: 10px 15px; border:none; flex: 1;">এখন না</button>
                </div>
            </div>`;
        document.body.appendChild(popup);

        const closeAndRemovePopup = (statusToSet) => {
            localStorage.setItem(locationPermissionKey, statusToSet);
            if (document.body.contains(popup)) document.body.removeChild(popup);
        };

        popup.querySelector('.popup-close').addEventListener('click', () => closeAndRemovePopup('denied_temporary'));
        document.getElementById('denyLocationBtn').addEventListener('click', () => closeAndRemovePopup('denied_temporary'));
        document.getElementById('grantLocationBtn').addEventListener('click', () => {
            closeAndRemovePopup('pending_browser_prompt');
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    () => localStorage.setItem(locationPermissionKey, 'granted'),
                    () => localStorage.setItem(locationPermissionKey, 'denied_persistent')
                );
            } else {
                 localStorage.setItem(locationPermissionKey, 'denied_unavailable');
            }
        });
    }

    loadAllDataScripts();
    if (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html')) {
        setTimeout(requestUserLocation, 2000); // Slight delay for user to see page first
    }
});