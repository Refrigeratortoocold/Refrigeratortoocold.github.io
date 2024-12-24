const newImageButton = document.getElementById('newImageButton');
const randomImage = document.getElementById('randomImage');

newImageButton.addEventListener('click', () => {
    // Use current timestamp as a cache-busting mechanism
    const timestamp = new Date().getTime(); // Get current time in milliseconds
    
    // Hide the image with a fade-out effect
    randomImage.classList.add('hidden');
    
    // Set the new image source with a timestamp query to avoid caching
    randomImage.src = `https://picsum.photos/400/300?random=${timestamp}`;
    
    // Show the new image with a fade-in effect once it's loaded
    randomImage.onload = () => {
        randomImage.classList.remove('hidden');
    };
});

// Optionally, load a random image on page load
window.onload = () => {
    newImageButton.click(); // Trigger the button click to load an image automatically
};
