// Filename: assets/js/data/grocery_data.js
// All string values intended for display must be in Bengali.

const grocery_products_list = [
    {
        id: "grocery001",
        name: "চিনি (১ কেজি)",
        price: 140,
        imageUrl: "assets/images/placeholder_product.png", // Replace with actual image path
        brandName: "দেশী চিনি", // Example Brand
        description: "উন্নত মানের পরিষ্কার দেশী চিনি, ১ কেজি প্যাক।",
        stockCount: 150,
        categoryName: "গ্রোসারি আইটেম" // Bengali Category Name
    },
    {
        id: "grocery002",
        name: "সয়াবিন তেল (৫ লিটার)",
        price: 850,
        imageUrl: "assets/images/placeholder_product.png", // Replace with actual image path
        brandName: "তীর মার্কা", // Example Brand
        description: "পুষ্টিগুণে ভরপুর সয়াবিন তেল, ৫ লিটারের জার। রান্নার জন্য সেরা।",
        stockCount: 80,
        categoryName: "গ্রোসারি আইটেম"
    },
    {
        id: "grocery003",
        name: "মসুর ডাল (৫০০ গ্রাম)",
        price: 75,
        imageUrl: "assets/images/placeholder_product.png", // Replace with actual image path
        brandName: "ফ্রেশ", // Example Brand
        description: " বাছাই করা সেরা মানের মসুর ডাল, ৫০০ গ্রামের প্যাকেট।",
        stockCount: 200,
        categoryName: "গ্রোসারি আইটেম"
    },
    {
        id: "grocery004",
        name: "আটা (২ কেজি)",
        price: 110,
        imageUrl: "assets/images/placeholder_product.png", // Replace with actual image path
        brandName: "পুষ্টি আটা", // Example Brand
        description: "সম্পূর্ণ পুষ্টিকর লাল আটা, রুটি ও পরোটার জন্য উৎকৃষ্ট। ২ কেজি প্যাক।",
        stockCount: 120,
        categoryName: "গ্রোসারি আইটেম"
    }
];

// Note: The JavaScript files that load product data (like shared-data-loader.js, 
// category-loader.js, etc.) are set up to look for a variable named 
// based on the filename, e.g., 'grocery_products_list' for 'grocery_data.js'.
// No need to call window.registerProducts() from here if using that loading mechanism.
// Ensure the variable name 'grocery_products_list' matches this convention.