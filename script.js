const newImageButton = document.getElementById('newImageButton');
const randomImage = document.getElementById('randomImage');

newImageButton.addEventListener('click', () => {
    // Set a new random image URL when the button is clicked
    randomImage.src = `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`;
});
