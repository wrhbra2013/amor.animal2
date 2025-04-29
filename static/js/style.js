// Coloque isso em um arquivo .js linkado no seu HTML, ou dentro de <script> no final do body

document.addEventListener('DOMContentLoaded', () => {
    const mobileToggle = document.querySelector('.nav-mobile-toggle');
    const nav = document.querySelector('nav'); // Seleciona o elemento <nav>

    if (mobileToggle && nav) {
        mobileToggle.addEventListener('click', () => {
            nav.classList.toggle('active'); // Adiciona/remove a classe 'active'

            // Atualiza aria-expanded para acessibilidade
            const isExpanded = nav.classList.contains('active');
            mobileToggle.setAttribute('aria-expanded', isExpanded);
        });
    }
});
