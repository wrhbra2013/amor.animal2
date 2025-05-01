// Seleciona os elementos
const navToggle = document.querySelector('.menu-toggle'); // Ou a classe correta do seu botão
const mainNavList = document.querySelector('.main-nav ul'); // Ou o seletor correto da sua lista
const mobileBreakpoint = 600; // Defina o mesmo breakpoint do seu CSS

// Função para abrir/fechar o menu
function toggleMenu() {
    if (mainNavList && navToggle) {
        mainNavList.classList.toggle('show'); // Usa a classe '.show' do seu CSS
        navToggle.classList.toggle('active'); // Opcional: para estilizar o botão

        // Atualiza aria-expanded
        const isExpanded = mainNavList.classList.contains('show');
        navToggle.setAttribute('aria-expanded', isExpanded);
    }
}

// Adiciona o listener de clique ao botão
if (navToggle) {
    navToggle.addEventListener('click', toggleMenu);
}

// Verifica no carregamento da página se deve abrir o menu
document.addEventListener('DOMContentLoaded', () => {
    if (window.innerWidth <= mobileBreakpoint && mainNavList && navToggle) {
        // Adiciona a classe para mostrar o menu automaticamente em mobile
        mainNavList.classList.add('show');
        navToggle.classList.add('active'); // Ativa o botão também, se necessário
        navToggle.setAttribute('aria-expanded', 'true'); // Define o estado inicial
    } else if (mainNavList && navToggle) {
         // Garante que o menu esteja fechado em telas maiores no carregamento
         mainNavList.classList.remove('show');
         navToggle.classList.remove('active');
         navToggle.setAttribute('aria-expanded', 'false');
    }
});

// Opcional: Reavaliar ao redimensionar a janela (pode ser complexo para UX)
// window.addEventListener('resize', () => {
//    // Lógica similar à do DOMContentLoaded, mas pode causar reaberturas indesejadas
// });
