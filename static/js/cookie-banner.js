 // static/js/cookie-banner.js
 document.addEventListener('DOMContentLoaded', () => {
     const banner = document.getElementById('cookie-consent-banner');
     const acceptButton = document.getElementById('accept-cookie-btn');
 
     // Verifica se o banner e o botão existem na página atual
     if (banner && acceptButton) {
         acceptButton.addEventListener('click', () => {
             // Define a data de expiração (ex: 1 ano a partir de agora)
             const expires = new Date();
             expires.setFullYear(expires.getFullYear() + 1);
 
             // Cria o cookie
             // path=/ -> Cookie disponível em todo o site
             // expires -> Data de expiração
             // SameSite=Lax -> Boa prática de segurança
             document.cookie = `cookie_consent=accepted; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
 
             // Esconde o banner após o clique
             banner.style.display = 'none';
         });
     }
     // Se o banner não estiver sendo exibido (porque o cookie já existe),
     // este código simplesmente não fará nada, o que é o esperado.
 });
 