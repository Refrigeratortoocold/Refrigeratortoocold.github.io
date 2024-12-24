const newImageButton = document.getElementById('newImageButton');
const randomImage = document.getElementById('randomImage');

const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // Replace with your actual Unsplash API key
const API_URL = `https://api.unsplash.com/photos/random?client_id=${UNSPLASH_ACCESS_KEY}`;

newImageButton.addEventListener('click', () => {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            // Get the URL of the random image
            const imageUrl = data[0].urls.regular;
            // Set the image source to the random image URL
            randomImage.src = imageUrl;
        })
        .catch(error => console.error('Error fetching image:', error));
});

// Load a random image on page load
window.onload = () => {
    newImageButton.click(); // Trigger the button click to load an image
};
