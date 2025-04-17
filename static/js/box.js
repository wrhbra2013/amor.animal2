function toggleVisibilityWithTimeout(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.toggle('hidden');
        setTimeout(() => {
            element.classList.add('hidden');
        }, 5000); // Adjust timeout duration as needed
    }
}