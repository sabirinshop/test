// Filename: assets/js/shared-data-loader.js
// This module provides a reusable function to load all product data.

async function loadAllShopProducts(productDataSourceFiles) {
    let allShopProductsAccumulator = [];
    let filesSuccessfullyProcessed = 0;

    // This function assumes data files (e.g., cosmetics_data.js) define a specific variable like `*_products_list`
    // and that these scripts are small and primarily for data definition.
    for (const filePath of productDataSourceFiles) {
        try {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = filePath;
                script.onload = () => {
                    // Convention: cosmetics_data.js -> cosmetics_products_list
                    const baseName = filePath.split('/').pop().split('.')[0].replace('_data', '');
                    const dataListName = `${baseName}_products_list`;
                    
                    if (window[dataListName] && Array.isArray(window[dataListName])) {
                        window[dataListName].forEach(p => allShopProductsAccumulator.push({...p}));
                        filesSuccessfullyProcessed++;
                    } else {
                        console.warn(`Data variable ${dataListName} not found or not an array after loading ${filePath}`);
                    }
                    resolve();
                };
                script.onerror = (err) => {
                    console.error(`Error loading product data script: ${filePath}`, err);
                    reject(new Error(`Failed to load ${filePath}`));
                };
                document.head.appendChild(script);
            });
        } catch (err) {
            // Error already logged by onerror or if promise rejected
            console.error(`Exception during script load promise for ${filePath}:`, err);
        }
    }

    // Note: This relies on the number of files. If a file fails to load data but script executes onload,
    // it might lead to incomplete data. More robust error handling/reporting might be needed for production.
    // console.log(`Shared data loader: ${filesSuccessfullyProcessed} files processed successfully out of ${productDataSourceFiles.length}. Total products loaded: ${allShopProductsAccumulator.length}`);
    return allShopProductsAccumulator;
}

// Expose the loader function globally for other scripts
window.sharedDataLoader = {
    loadAllShopProducts
};