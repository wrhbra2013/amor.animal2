 /**
  * Alterna a classe 'high-contrast' no elemento body
  * para ativar/desativar o modo de alto contraste.
  * 
  */


 // Get references specifically
 const highContrastButton = document.getElementById('high-contrast-toggle');
 const navLinks = document.querySelectorAll('.main-navbar a.nav-link');
 
 // Example: Adding an 'active' class to a clicked nav link
 navLinks.forEach(link => {
     link.addEventListener('click', function(event) {
         // First, remove 'active-nav-item' from all nav links
         navLinks.forEach(el => el.classList.remove('active-nav-item'));
         // Then, add it only to the clicked link
         event.target.classList.add('active-nav-item');
 
         // --- Crucially, this code does NOT interact with highContrastButton ---
     });
 });
 
 // Example: Toggling high contrast (separate logic)
 if (highContrastButton) {
     highContrastButton.addEventListener('click', function() {
         document.body.classList.toggle('high-contrast'); // Example: Toggles a class on the body
         highContrastButton.classList.toggle('active'); // Toggles button's own active state
         // Store preference if needed (e.g., in localStorage)
     });
 }
 
 function toggleHighContrast() {
   const body = document.body;
   if (body.classList.contains("high-contrast")) {
     body.classList.remove("high-contrast");
     // Opcional: Salvar preferência (ex: localStorage)
    localStorage.setItem('highContrastEnabled', 'false');
   } else {
     body.classList.add("high-contrast");
     // Opcional: Salvar preferência
    localStorage.setItem('highContrastEnabled', 'true');
   }
 }
 
 // Opcional: Aplicar o modo ao carregar a página se salvo anteriormente
// document.addEventListener('DOMContentLoaded', () => {
//    if (localStorage.getItem('highContrastEnabled') === 'true') {
//       document.body.classList.add('high-contrast');
//     }
//    });

 toggleHighContrast()