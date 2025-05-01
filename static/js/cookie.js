 // /home/wander/amor.animal2/static/js/cookie.js
 
 document.addEventListener("DOMContentLoaded", function() {
     // Todo o código que manipula o DOM (criar banner, adicionar listener)
     // deve ficar aqui dentro.
 
     // Check if the user has already accepted cookies
     function showCookieBanner() {
         if (localStorage.getItem("cookiesAccepted")) {
             // User has accepted cookies, do nothing
             console.log("Cookies já aceitos."); // Opcional: para depuração
         } else {
             // User has not accepted cookies, show the banner
             console.log("Mostrando banner de cookies."); // Opcional: para depuração
             const banner = document.createElement("div");
             banner.id = "cookie-banner";
             // Estilos do banner (mantidos como no seu código original)
             banner.style.position = "fixed";
             banner.style.bottom = "0";
             banner.style.left = "0"; // Garante que comece na borda esquerda
             banner.style.width = "100%";
             banner.style.backgroundColor = "#333";
             banner.style.color = "#fff";
             banner.style.padding = "15px"; // Um pouco mais de espaço
             banner.style.boxSizing = "border-box"; // Inclui padding na largura
             banner.style.textAlign = "center";
             banner.style.zIndex = "1000";
             banner.style.fontSize = "14px"; // Fonte um pouco menor
 
             banner.innerHTML = `
                 <p style="margin: 0 0 10px 0; display: block;"> <!-- Parágrafo como bloco para botão ficar abaixo -->
                     Nós usamos cookies para melhorar sua experiência de navegação. Ao usar o site você estará concordando com nossos termos.
                     <a href="/privacy-policy" style="color: #4CAF50; text-decoration: underline;">Política de Privacidade</a>.
                 </p>
                 <button id="accept-cookies" style="padding: 8px 15px; background-color: #4CAF50; color: #fff; border: none; border-radius: 4px; cursor: pointer;">Aceitar</button>
             `;
 
             // Adiciona o banner ao body (que já existe neste ponto)
             document.body.appendChild(banner);
 
             // Adiciona o listener ao botão DENTRO do banner
             const acceptButton = document.getElementById("accept-cookies");
             if (acceptButton) {
                  acceptButton.addEventListener("click", () => {
                     localStorage.setItem("cookiesAccepted", "true");
                     // Remove o banner específico que foi criado
                     const bannerElement = document.getElementById("cookie-banner");
                      if (bannerElement && bannerElement.parentNode === document.body) {
                          document.body.removeChild(bannerElement);
                      }
                 });
             }
         }
     }
 
     // Chama a função para verificar e mostrar o banner quando o DOM estiver pronto
     showCookieBanner();
 
 }); // Fim do DOMContentLoaded listener
 