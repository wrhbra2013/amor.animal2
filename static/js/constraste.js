document.addEventListener('DOMContentLoaded', function () {
  const contrastToggleButton = document.getElementById('contrast-toggle-button');
  const bodyElement = document.body;

  // Verifica se o modo de alto contraste já estava ativo (usando localStorage)
  if (localStorage.getItem('highContrastEnabled') === 'true') {
      bodyElement.classList.add('high-contrast');
  }

  contrastToggleButton.addEventListener('click', function () {
      bodyElement.classList.toggle('high-contrast');
      
      // Salva a preferência do usuário no localStorage
      if (bodyElement.classList.contains('high-contrast')) {
          localStorage.setItem('highContrastEnabled', 'true');
      } else {
          localStorage.setItem('highContrastEnabled', 'false');
      }
  });
});