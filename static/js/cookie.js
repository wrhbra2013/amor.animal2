
    // Espera o DOM estar completamente carregado
    document.addEventListener('DOMContentLoaded', function() {
        // Seleciona o banner e o botão
        const cookieBanner = document.getElementById('cookie-consent-banner');
        const acceptCookieBtn = document.getElementById('accept-cookie-btn');

        // Verifica se o usuário já aceitou os cookies anteriormente
        if (localStorage.getItem('cookiesAccepted') === 'true') {
            if (cookieBanner) {
                cookieBanner.style.display = 'none';
            }
        } else {
            if (cookieBanner) {
                cookieBanner.style.display = 'block'; // Ou 'flex', dependendo do seu CSS
            }
        }

        // Adiciona um ouvinte de evento para o clique no botão
        if (acceptCookieBtn) {
            acceptCookieBtn.addEventListener('click', function() {
                if (cookieBanner) {
                    cookieBanner.style.display = 'none';
                }
                // Armazena a aceitação no localStorage para não mostrar novamente
                localStorage.setItem('cookiesAccepted', 'true');
            });
        }
    });
