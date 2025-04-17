function loadSlides() {
    const basePath = '../static/uploads/adocao/';
    const slidesContainer = document.getElementById('slides'); // Ensure you have a container with this ID in your HTML
    const totalSlides = 10; // Adjust this to the number of slides you expect

    for (let i = 1; i <= totalSlides; i++) {
        const slide = document.createElement('div');
        slide.className = 'slide'; // Optional: Add a class for styling
        const img = document.createElement('img');
        img.src = `${basePath}image${i}.jpg`; // Assuming files are named as image1.jpg, image2.jpg, etc.
        img.alt = `Slide ${i}`;
        slide.appendChild(img);
        slidesContainer.appendChild(slide);
    }
}

// Call the function after the DOM is fully loaded
document.addEventListener('DOMContentLoaded', loadSlides);