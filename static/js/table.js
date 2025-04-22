function toggleDetails() {
  const hiddenElements = document.querySelectorAll('.hidden');
  hiddenElements.forEach(element => {
    const currentDisplay = window.getComputedStyle(element).display;
    element.style.display = currentDisplay === 'table-cell' ? 'none' : 'table-cell';
  });
}