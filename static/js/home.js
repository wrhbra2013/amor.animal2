
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.getElementById('news-carousel');
    if (!carousel) return; // Sai se o carrossel não existir na página

    const slidesContainer = carousel.querySelector('.news-carousel-slides');
    const slides = Array.from(carousel.querySelectorAll('.news-carousel-slide'));
    const nextButton = carousel.querySelector('.news-carousel-control.next');
    const prevButton = carousel.querySelector('.news-carousel-control.prev');
    const dotsContainer = carousel.querySelector('.news-carousel-dots');
    const dots = dotsContainer ? Array.from(dotsContainer.querySelectorAll('.dot')) : [];

    if (slides.length === 0) return; // Sai se não houver slides

    let currentIndex = 0;
    let slideWidth = slides[0].offsetWidth; // Largura de um slide
                                          // (incluindo padding, se houver no .news-carousel-slide)

    function updateCarouselPosition() {
        // Recalcula a largura do slide em caso de redimensionamento ou conteúdo dinâmico
        // É mais seguro pegar a largura do container do carrossel
        // se os slides devem ocupar 100% dele.
        slideWidth = carousel.querySelector('.news-carousel-slide').offsetWidth;
        slidesContainer.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

        // Atualiza a classe 'active' nos slides (opcional, se você usar para algo)
        slides.forEach((slide, index) => {
            slide.classList.toggle('active', index === currentIndex);
        });

        // Atualiza a classe 'active' nos dots
        if (dots.length > 0) {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
    }

    function goToSlide(index) {
        currentIndex = index;
        if (currentIndex < 0) {
            currentIndex = slides.length - 1;
        } else if (currentIndex >= slides.length) {
            currentIndex = 0;
        }
        updateCarouselPosition();
    }

    if (nextButton && prevButton) {
        nextButton.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });

        prevButton.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });
    }

    if (dots.length > 0) {
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.dataset.slide);
                goToSlide(slideIndex);
            });
        });
    }

    // Ajustar em caso de redimensionamento da janela
    window.addEventListener('resize', () => {
        // Desabilitar temporariamente a transição para evitar saltos estranhos durante o redimensionamento
        slidesContainer.style.transition = 'none';
        updateCarouselPosition();
        // Forçar reflow para garantir que a mudança de transform seja aplicada antes de reabilitar a transição
        slidesContainer.offsetHeight; // eslint-disable-line no-unused-expressions
        slidesContainer.style.transition = 'transform 0.5s ease-in-out';
    });

    // Configuração inicial
    updateCarouselPosition();

    // Opcional: Auto-play
    // let autoPlayInterval;
    // const startAutoPlay = () => {
    //     autoPlayInterval = setInterval(() => {
    //         goToSlide(currentIndex + 1);
    //     }, 5000); // Muda a cada 5 segundos
    // };
    // const stopAutoPlay = () => {
    //     clearInterval(autoPlayInterval);
    // };

    // carousel.addEventListener('mouseenter', stopAutoPlay);
    // carousel.addEventListener('mouseleave', startAutoPlay);
    // startAutoPlay(); // Inicia o auto-play
});

