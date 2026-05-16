/* ═══════════════════════════════════════
   script.js — JS compartido
   ═══════════════════════════════════════ */

/* ── 1. NAV: hamburguesa + scrolled + activo ── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navbar    = document.getElementById('navbar');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    const [s1, s2, s3] = hamburger.querySelectorAll('span');
    if (isOpen) {
      s1.style.transform = 'rotate(45deg) translate(5px, 5px)';
      s2.style.opacity   = '0';
      s3.style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      s1.style.transform = s2.style.opacity = s3.style.transform = '';
    }
  });

  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => {
        s.style.transform = s.style.opacity = '';
      });
    });
  });
}

/* Marcar enlace activo según la página actual */
if (navLinks) {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === current) a.classList.add('active');
  });
}

/* Sombra al hacer scroll */
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}


/* ── 2. SCROLL REVEAL ── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

if (revealEls.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.14 });

  revealEls.forEach(el => observer.observe(el));
}


/* ── 3. SLIDER (galeria.html) ── */
const track    = document.getElementById('sliderTrack');
const dotsWrap = document.getElementById('sliderDots');

if (track && dotsWrap) {
  const slides = Array.from(track.querySelectorAll('.slide'));
  let currentSlide = 0;
  let autoTimer    = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Ir a imagen ' + (i + 1));
    dot.addEventListener('click', () => { goTo(i); resetAutoplay(); });
    dotsWrap.appendChild(dot);
  });

  function goTo(n) {
    currentSlide = ((n % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dotsWrap.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  document.getElementById('sliderPrev')?.addEventListener('click', () => { goTo(currentSlide - 1); resetAutoplay(); });
  document.getElementById('sliderNext')?.addEventListener('click', () => { goTo(currentSlide + 1); resetAutoplay(); });

  function startAutoplay() { autoTimer = setInterval(() => goTo(currentSlide + 1), 4000); }
  function resetAutoplay() { clearInterval(autoTimer); startAutoplay(); }

  startAutoplay();

  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? currentSlide + 1 : currentSlide - 1); resetAutoplay(); }
  });
}


/* ── 4. FORMULARIO (contacto.html) ── */
const btnEnviar = document.getElementById('btnEnviar');
const formMsg   = document.getElementById('formMsg');

if (btnEnviar && formMsg) {
  btnEnviar.addEventListener('click', () => {
    const nombre   = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email    = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const mensaje  = document.getElementById('mensaje').value.trim();

    formMsg.style.display = 'none';
    formMsg.className = 'form-msg';

    if (!nombre || !apellido ||!telefono ||!email || !mensaje) {
      mostrarMsg('⚠ Por favor, completa todos los campos antes de enviar.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      mostrarMsg('⚠ Por favor, ingresa un correo electrónico válido.', 'error');
      return;
    }

    btnEnviar.textContent   = 'Enviando...';
    btnEnviar.disabled      = true;
    btnEnviar.style.opacity = '0.7';

    setTimeout(() => {
      mostrarMsg('✓ ¡Mensaje enviado con éxito! Nos pondremos en contacto muy pronto.', 'success');
      ['nombre','apellido','email','mensaje'].forEach(id => { document.getElementById(id).value = ''; });
      btnEnviar.textContent   = 'Enviar Mensaje';
      btnEnviar.disabled      = false;
      btnEnviar.style.opacity = '1';
    }, 1400);
  });

  function mostrarMsg(texto, tipo) {
    formMsg.textContent = texto;
    formMsg.classList.add(tipo);
    formMsg.style.display = 'block';
  }
}
