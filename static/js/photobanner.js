document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.photobanner-slide');
  const dots = document.querySelectorAll('.photobanner-dots .dot'); // Para indicadores
  const nextButton = document.querySelector('.photobanner-control.next');
  const prevButton = document.querySelector('.photobanner-control.prev');
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    // Esconde o slide atual
    slides[currentSlide].classList.remove('active');
    if (dots.length > 0) dots[currentSlide].classList.remove('active');

    // Calcula o próximo índice
    currentSlide = (index + slides.length) % slides.length; // Garante loop

    // Mostra o novo slide
    slides[currentSlide].classList.add('active');
    if (dots.length > 0) dots[currentSlide].classList.add('active');
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  function startSlideShow(interval = 5000) { // Troca a cada 5 segundos
    stopSlideShow(); // Garante que não haja múltiplos intervalos
    slideInterval = setInterval(nextSlide, interval);
  }

  function stopSlideShow() {
    clearInterval(slideInterval);
  }

  // --- Inicialização e Eventos ---
  if (slides.length > 1) { // Só ativa se houver mais de um slide
    // Exibe o primeiro slide imediatamente
    slides[0].classList.add('active');
    if (dots.length > 0) dots[0].classList.add('active');

    // Inicia a troca automática
    startSlideShow();

    // Pausa ao passar o mouse sobre o banner (opcional)
    const bannerContainer = document.querySelector('.photobanner-container');
    if (bannerContainer) {
        bannerContainer.addEventListener('mouseenter', stopSlideShow);
        bannerContainer.addEventListener('mouseleave', startSlideShow);
    }


    // Eventos para botões de controle (se existirem)
    if (nextButton) {
      nextButton.addEventListener('click', () => {
        nextSlide();
        // Reinicia o timer após clique manual (opcional)
        startSlideShow();
      });
    }
    if (prevButton) {
      prevButton.addEventListener('click', () => {
        prevSlide();
        // Reinicia o timer após clique manual (opcional)
        startSlideShow();
      });
    }

    // Eventos para indicadores (pontos) (se existirem)
    if (dots.length > 0) {
      dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
          const slideIndex = parseInt(e.target.dataset.slide, 10);
          if (!isNaN(slideIndex)) {
            showSlide(slideIndex);
            // Reinicia o timer após clique manual (opcional)
            startSlideShow();
          }
        });
      });
    }
  } else if (slides.length === 1) {
      // Se houver apenas um slide, apenas o exibe
      slides[0].classList.add('active');
      // Esconde controles e pontos se houver apenas um slide
      if(nextButton) nextButton.style.display = 'none';
      if(prevButton) prevButton.style.display = 'none';
      const dotsContainer = document.querySelector('.photobanner-dots');
      if(dotsContainer) dotsContainer.style.display = 'none';
  }

});
