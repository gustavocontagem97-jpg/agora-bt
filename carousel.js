/* =========================================
   BT — carousel.js
   ========================================= */

let carouselIdx = 0;
let carouselTimer = null;
let carouselSlides = 0;

function renderCarousel() {
  const track = document.getElementById('carousel-track');
  const dots = document.getElementById('carousel-dots');
  if (!track || !dots) return;

  const promos = BT.get('promocoes', [
    { titulo: 'Bem-vindo ao BT!', imagem: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&h=350&fit=crop', link: '#' },
    { titulo: 'Ofertas Imperdíveis', imagem: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=1200&h=350&fit=crop', link: '#' },
    { titulo: 'Novidades da Semana', imagem: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=350&fit=crop', link: '#' }
  ]);

  carouselSlides = promos.length;
  track.innerHTML = '';
  dots.innerHTML = '';

  promos.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'carousel-slide';
    slide.innerHTML = `
      <a href="${p.link || '#'}" target="_blank" rel="noopener noreferrer">
        <img src="${p.imagem}" alt="${p.titulo}" loading="${i === 0 ? 'eager' : 'lazy'}" />
      </a>
      <div class="carousel-caption">${p.titulo}</div>
    `;
    track.appendChild(slide);

    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Ir para slide ${i + 1}`);
    dot.addEventListener('click', () => { goToSlide(i); resetAutoPlay(); });
    dots.appendChild(dot);
  });

  goToSlide(0);
}

function goToSlide(i) {
  carouselIdx = (i + carouselSlides) % carouselSlides;
  const track = document.getElementById('carousel-track');
  if (track) track.style.transform = `translateX(-${carouselIdx * 100}%)`;
  document.querySelectorAll('.carousel-dot').forEach((d, idx) => {
    d.classList.toggle('active', idx === carouselIdx);
  });
}

function resetAutoPlay() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => goToSlide(carouselIdx + 1), 5000);
}

window.addEventListener('DOMContentLoaded', () => {
  renderCarousel();
  resetAutoPlay();

  document.getElementById('carousel-prev')?.addEventListener('click', () => {
    goToSlide(carouselIdx - 1);
    resetAutoPlay();
  });
  document.getElementById('carousel-next')?.addEventListener('click', () => {
    goToSlide(carouselIdx + 1);
    resetAutoPlay();
  });
});
