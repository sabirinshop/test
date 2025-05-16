// Filename: assets/js/home-map-loader.js
document.addEventListener('DOMContentLoaded', () => {
    const mapSection = document.getElementById('map-section');
    if (!mapSection) {
        // console.error("Map section with ID 'map-section' not found.");
        return;
    }

    // --- Configuration for the Map ---
    // Using Joypurhat Sadar as a placeholder location. Replace with your actual coordinates or address.
    const latitude = 25.0934;  // Approximate latitude for Joypurhat
    const longitude = 89.0222; // Approximate longitude for Joypurhat
    const zoomLevel = 14;      // Adjust zoom level as needed (e.g., 14-16 for city level)
    const mapLanguage = 'bn';  // Bengali language for map interface

    // Construct the Google Maps embed URL
    const mapSrc = `https://maps.google.com/maps?q=${latitude},${longitude}&hl=${mapLanguage}&z=${zoomLevel}&ie=UTF8&iwloc=B&output=embed`;
    // Note: &iwloc=B attempts to show info window marker at the location.
    // For a cleaner map without marker info bubble, you might simplify the q parameter or use other embed options.

    // Clear the original placeholder content
    const existingPlaceholder = mapSection.querySelector('.map-placeholder');
    if (existingPlaceholder) {
        existingPlaceholder.innerHTML = ''; // Clear it
        existingPlaceholder.style.display = 'none'; // Hide it
    }

    // Create map container and iframe dynamically
    const mapContainer = document.createElement('div');
    mapContainer.className = 'map-container-dynamic'; // Styled by home-map.css

    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', mapSrc);
    iframe.setAttribute('width', '100%'); // Redundant if CSS handles it, but good fallback
    iframe.setAttribute('height', '100%'); // Redundant if CSS handles it
    iframe.setAttribute('style', 'border:0;');
    iframe.setAttribute('allowfullscreen', '');
    iframe.setAttribute('loading', 'lazy'); // Lazy load the map
    iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
    iframe.setAttribute('title', 'দোকানের অবস্থান'); // Shop Location in Bengali

    mapContainer.appendChild(iframe);
    mapSection.appendChild(mapContainer); // Append the new map container to the section
});