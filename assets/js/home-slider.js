// Filename: assets/js/home-slider.js
document.addEventListener('DOMContentLoaded', () => {
    const sliderSection = document.getElementById('slider-section');
    if (!sliderSection) {
        // console.error("Slider section with ID 'slider-section' not found.");
        return;
    }

    // Placeholder image URLs (replace with your actual image paths/URLs)
    const slideImages = [
        "assets/images/slider/placeholder-slide1.jpg", // Ensure these image paths are correct
        "assets/images/slider/placeholder-slide2.jpg",
        "assets/images/slider/placeholder-slide3.jpg"
    ];

    if (slideImages.length === 0) {
        // console.log("No images provided for the slider.");
        // Optionally, keep the placeholder visible or show a message
        const placeholder = sliderSection.querySelector('.slider-placeholder');
        if (placeholder) placeholder.style.display = 'block'; // Show original placeholder
        return;
    }
    
    // Clear the original placeholder content
    const existingPlaceholder = sliderSection.querySelector('.slider-placeholder');
    if (existingPlaceholder) {
        existingPlaceholder.innerHTML = ''; // Clear it to make space for dynamic slider
        existingPlaceholder.style.display = 'none'; // Hide it
    }


    // Create slider HTML structure dynamically
    const sliderContainer = document.createElement('div');
    sliderContainer.className = 'slider-container-dynamic';

    const sliderWrapper = document.createElement('div');
    sliderWrapper.className = 'slider-wrapper';

    slideImages.forEach((src, index) => {
        const slide = document.createElement('div');
        slide.className = 'slider-slide';
        const img = document.createElement('img');
        img.src = src;
        img.alt = `স্লাইড ${index + 1}`; // Slide in Bengali
        slide.appendChild(img);
        sliderWrapper.appendChild(slide);
    });

    sliderContainer.appendChild(sliderWrapper);

    // Add Navigation Buttons (if more than one slide)
    if (slideImages.length > 1) {
        const prevButton = document.createElement('button');
        prevButton.className = 'slider-nav-button prev';
        prevButton.innerHTML = '&#10094;'; // Left arrow
        prevButton.setAttribute('aria-label', 'পূর্ববর্তী স্লাইড'); // Previous Slide in Bengali

        const nextButton = document.createElement('button');
        nextButton.className = 'slider-nav-button next';
        nextButton.innerHTML = '&#10095;'; // Right arrow
        nextButton.setAttribute('aria-label', 'পরবর্তী স্লাইড'); // Next Slide in Bengali
        
        sliderContainer.appendChild(prevButton);
        sliderContainer.appendChild(nextButton);

        // Add Dots Navigation
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'slider-dots';
        slideImages.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'slider-dot';
            dot.dataset.slideTo = index;
            if (index === 0) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        });
        sliderContainer.appendChild(dotsContainer);
    }

    // Append the dynamically created slider to the section
    sliderSection.appendChild(sliderContainer);


    // Slider Logic
    let currentIndex = 0;
    const totalSlides = slideImages.length;
    let autoplayInterval;
    const AUTOPLAY_DELAY = 5000; // 5 seconds

    function updateSliderPosition() {
        sliderWrapper.style.transform = `translateX(-${currentIndex * 100}%)`;
        updateDots();
    }

    function updateDots() {
        const dots = sliderContainer.querySelectorAll('.slider-dot');
        if (dots.length > 0) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[currentIndex].classList.add('active');
        }
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateSliderPosition();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateSliderPosition();
    }
    
    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            currentIndex = index;
            updateSliderPosition();
        }
    }

    function startAutoplay() {
        if (totalSlides <= 1) return; // No autoplay for single slide
        stopAutoplay(); // Clear existing interval
        autoplayInterval = setInterval(nextSlide, AUTOPLAY_DELAY);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Event Listeners for Nav Buttons and Dots
    if (totalSlides > 1) {
        const prevBtnElem = sliderContainer.querySelector('.slider-nav-button.prev');
        const nextBtnElem = sliderContainer.querySelector('.slider-nav-button.next');
        const dots = sliderContainer.querySelectorAll('.slider-dot');

        if (prevBtnElem) {
            prevBtnElem.addEventListener('click', () => {
                prevSlide();
                stopAutoplay(); // Optional: stop autoplay on manual navigation
                // startAutoplay(); // Optional: restart autoplay after manual navigation
            });
        }
        if (nextBtnElem) {
            nextBtnElem.addEventListener('click', () => {
                nextSlide();
                stopAutoplay();
                // startAutoplay();
            });
        }
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                goToSlide(parseInt(e.target.dataset.slideTo));
                stopAutoplay();
                // startAutoplay();
            });
        });
        
        // Pause autoplay on hover
        sliderContainer.addEventListener('mouseenter', stopAutoplay);
        sliderContainer.addEventListener('mouseleave', startAutoplay);

        startAutoplay(); // Initial start
    }
    
    // Initial position update (especially if only one slide, to ensure it's visible)
    if (totalSlides > 0) {
       updateSliderPosition(); // Show the first slide correctly
    }

    // Basic Touch/Swipe (very simplified, for better UX use a library or more complex logic)
    let touchStartX = 0;
    let touchEndX = 0;

    sliderWrapper.addEventListener('touchstart', (event) => {
        touchStartX = event.changedTouches[0].screenX;
        stopAutoplay(); // Stop autoplay when user interacts
    }, { passive: true });

    sliderWrapper.addEventListener('touchend', (event) => {
        touchEndX = event.changedTouches[0].screenX;
        handleSwipeGesture();
        // startAutoplay(); // Optionally restart autoplay after swipe
    }, { passive: true });

    function handleSwipeGesture() {
        if (totalSlides <= 1) return;
        const swipeThreshold = 50; // Minimum pixels for a swipe
        if (touchEndX < touchStartX - swipeThreshold) {
            nextSlide(); // Swiped left
        }
        if (touchEndX > touchStartX + swipeThreshold) {
            prevSlide(); // Swiped right
        }
    }
});