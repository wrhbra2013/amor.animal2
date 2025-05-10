 // public/js/main.js
 document.addEventListener('DOMContentLoaded', () => {
     const mobileMenuButton = document.querySelector('.mobile-menu-button');
     const mobileMenu = document.querySelector('.mobile-menu');
     // Opcional: Adicionar um botão de fechar dentro do menu móvel
     // const mobileMenuCloseButton = document.querySelector('.mobile-menu-close');
 
     if (mobileMenuButton && mobileMenu) {
         mobileMenuButton.addEventListener('click', () => {
             mobileMenu.classList.toggle('active'); // Adiciona/remove a classe .active
             const isExpanded = mobileMenuButton.getAttribute('aria-expanded') === 'true' || false;
             mobileMenuButton.setAttribute('aria-expanded', !isExpanded);
             mobileMenu.setAttribute('aria-hidden', isExpanded); // Se antes estava visível (expanded), agora está escondido (hidden)
         });
     }
 
     // Se você adicionou um botão de fechar dentro do menu:
     // if (mobileMenuCloseButton && mobileMenu) {
     //     mobileMenuCloseButton.addEventListener('click', () => {
     //         mobileMenu.classList.remove('active');
     //         mobileMenuButton.setAttribute('aria-expanded', 'false');
     //         mobileMenu.setAttribute('aria-hidden', 'true');
     //     });
     // }
 
     // Opcional: Fechar o menu ao clicar em um link (para SPAs ou navegação na mesma página)
     if (mobileMenu) {
         const menuLinks = mobileMenu.querySelectorAll('a');
         menuLinks.forEach(link => {
             link.addEventListener('click', () => {
                 if (mobileMenu.classList.contains('active')) {
                     mobileMenu.classList.remove('active');
                     mobileMenuButton.setAttribute('aria-expanded', 'false');
                     mobileMenu.setAttribute('aria-hidden', 'true');
                 }
             });
         });
     }
 });
 