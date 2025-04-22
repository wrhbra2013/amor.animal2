// Function to handle the click event on the "Adote" button
document.addEventListener('DOMContentLoaded', function() {
  const adoteButton = document.querySelector('.adote-button');
  const adoteContainer = document.querySelector('.adote-container');

  adoteButton.addEventListener('click', function() {
    adoteContainer.style.display = 'inline-block';
    adoteButton.style.display = 'none';
  });
});

function toggleDetails() {
  const hiddenElements = document.querySelectorAll('.hidden');
  hiddenElements.forEach(element => {
    if (element.style.display === 'table-cell') {
      element.style.display = 'none';
    } else {
      element.style.display = 'table-cell';
      element.style.overflow = 'hidden';
      element.style.textOverflow = 'ellipsis';    
    }
  });
}

