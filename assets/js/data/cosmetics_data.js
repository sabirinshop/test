// Filename: assets/js/data/cosmetics_data.js
const cosmetics_products_list = [
    {
        id: "cosmetic001",
        name: "লাল লিপস্টিক",
        price: 350,
        imageUrl: "assets/images/placeholder_product.png", // Create this placeholder or use actual URL
        brandName: "সাজগোজ",
        description: "এটি একটি উজ্জ্বল লাল রঙের দীর্ঘস্থায়ী লিপস্টিক, যা আপনার ঠোঁটকে আকর্ষণীয় করে তুলবে।",
        stockCount: 25,
        categoryName: "কসমেটিকস"
    },
    {
        id: "cosmetic002",
        name: "ত্বক ফর্সাকারী ক্রিম",
        price: 550,
        imageUrl: "assets/images/placeholder_product.png", // Create this placeholder or use actual URL
        brandName: "লাবণ্য",
        description: "এই ক্রিমটি নিয়মিত ব্যবহারে আপনার ত্বককে আরও উজ্জ্বল ও ফর্সা করে। সব ধরনের ত্বকের জন্য উপযোগী।",
        stockCount: 15,
        categoryName: "কসমেটিকস"
    },
    {
        id: "cosmetic003",
        name: "আইলাইনার (কালো)",
        price: 220,
        imageUrl: "assets/images/placeholder_product.png", // Create this placeholder or use actual URL
        brandName: "সাজগোজ",
        description: "গভীর কালো রঙের এই আইলাইনারটি আপনার চোখকে দেবে নিখুঁত আকর্ষণ। জলরোধী এবং দীর্ঘস্থায়ী।",
        stockCount: 30,
        categoryName: "কসমেটিকস"
    }
];

if (window.registerProducts) {
    window.registerProducts(cosmetics_products_list, "কসমেটিকস");
} else {
    console.error("registerProducts function not found in main.js. Ensure main.js is loaded first or brand_metadata.js correctly loads before data files if it contains registerProducts.");
}