 /**
  * Alterna a classe 'high-contrast' no elemento body
  * para ativar/desativar o modo de alto contraste.
  */
 function toggleHighContrast() {
   const body = document.body;
   if (body.classList.contains("high-contrast")) {
     body.classList.remove("high-contrast");
     // Opcional: Salvar preferência (ex: localStorage)
      //localStorage.setItem('highContrastEnabled', 'false');
   } else {
     body.classList.add("high-contrast");
     // Opcional: Salvar preferência
     localStorage.setItem('highContrastEnabled', 'true');
   }
 }
 
 // Opcional: Aplicar o modo ao carregar a página se salvo anteriormente
//  document.addEventListener('DOMContentLoaded', () => {
//     if (localStorage.getItem('highContrastEnabled') === 'true') {
//      document.body.classList.add('high-contrast');
//     }
//   });

 toggleHighContrast()