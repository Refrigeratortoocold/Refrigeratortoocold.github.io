const newImageButton = document.getElementById('newImageButton');
const randomImage = document.getElementById('randomImage');

newImageButton.addEventListener('click', () => {
    // Generate a random number to append to the image URL to avoid caching
    const randomNum = new Date().getTime(); // Current timestamp
    randomImage.classList.add('hidden'); // Hide image with a fade-out effect before changing it
    
    setTimeout(() => {
        // Change the image source and add the random query parameter to ensure a new image
        randomImage.src = `https://picsum.photos/400/300?random=${randomNum}`;
        randomImage.onload = () => randomImage.classList.remove('hidden'); // Fade the image back in after loading
    }, 300); // Delay to allow the fade-out transition to happen before changing the image
});

// Optional: Load a random image on page load
window.onload = () => {
    newImageButton.click(); // Trigger the button click to load an image automatically
};
