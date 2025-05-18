onHome () {
  const carrousel = document.querySelector('.animais-carrousel')
  const items = document.querySelectorAll('.animais-carrousel-item')
  const prev = document.querySelector('.animais-carrousel-prev')
  const next = document.querySelector('.animais-carrousel-next')
  let current = 0

  if (!carrousel || !items || !prev || !next) {
    return
  }

  const update = () => {
    items.forEach((item, index) => {
      item.classList.remove('animais-carrousel-item-active')
      item.classList.remove('animais-carrousel-item-prev')
      item.classList.remove('animais-carrousel-item-next')

      if (index === current) {
        item.classList.add('animais-carrousel-item-active')
      } else if (index === (current - 1 + items.length) % items.length) {
        item.classList.add('animais-carrousel-item-prev')
      } else if (index === (current + 1) % items.length) {
        item.classList.add('animais-carrousel-item-next')
      }
    })
  }

  prev.addEventListener('click', () => {
    current = (current - 1 + items.length) % items.length
    update()
  })

  next.addEventListener('click', () => {
    current = (current + 1) % items.length
    update()
  })

  update()
}

onHome()

// No seu arquivo carrousel.js ou em um novo arquivo js
function inicializarCarrosselNoticias() {
  const carrouselNoticias = document.querySelector('#newsCarouselContainer'); // Use o seletor correto
  const itemsNoticias = document.querySelectorAll('.news-item'); // Use o seletor correto
  const prevNoticias = document.querySelector('.news-prev-button'); // Use o seletor correto
  const nextNoticias = document.querySelector('.news-next-button'); // Use o seletor correto
  let currentNoticias = 0;

  if (!carrouselNoticias || itemsNoticias.length === 0 || !prevNoticias || !nextNoticias) {
    console.warn('Elementos do carrossel de notícias não encontrados.');
    return;
  }

  const updateNoticias = () => {
    itemsNoticias.forEach((item, index) => {
      item.classList.remove('active-news-slide'); // Use classes de ativo/prev/next específicas para notícias
      item.classList.remove('prev-news-slide');
      item.classList.remove('next-news-slide');

      if (index === currentNoticias) {
        item.classList.add('active-news-slide');
      } else if (index === (currentNoticias - 1 + itemsNoticias.length) % itemsNoticias.length) {
        item.classList.add('prev-news-slide');
      } else if (index === (currentNoticias + 1) % itemsNoticias.length) {
        item.classList.add('next-news-slide');
      }
      // Adicione mais lógica se precisar mostrar mais de um slide "vizinho"
    });
  };

  prevNoticias.addEventListener('click', () => {
    currentNoticias = (currentNoticias - 1 + itemsNoticias.length) % itemsNoticias.length;
    updateNoticias();
  });

  nextNoticias.addEventListener('click', () => {
    currentNoticias = (currentNoticias + 1) % itemsNoticias.length;
    updateNoticias();
  });

  if (itemsNoticias.length > 0) {
    updateNoticias(); // Inicializa o estado visual
  }
}

// Chame a nova função quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
  // onHome(); // Se você ainda usa o carrossel de animais
  inicializarCarrosselNoticias();
});
