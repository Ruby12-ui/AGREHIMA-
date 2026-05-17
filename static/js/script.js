/* ═══════════════════════════════════════
   script.js — JS compartido
   Se usa en todas las páginas del sitio
   ═══════════════════════════════════════ */


/* ──────────────────────────────────────
   SECCIÓN 1: NAVBAR
   Controla el menú hamburguesa (móvil),
   la sombra al hacer scroll y el link
   activo según la página actual
   ────────────────────────────────────── */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
const navbar    = document.getElementById('navbar');

/* --- Abrir/cerrar menú hamburguesa en móvil --- */
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    const [s1, s2, s3] = hamburger.querySelectorAll('span');

    /* Animación de las 3 líneas → X al abrir */
    if (isOpen) {
      s1.style.transform = 'rotate(45deg) translate(5px, 5px)';
      s2.style.opacity   = '0';
      s3.style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      /* Vuelven a ser 3 líneas al cerrar */
      s1.style.transform = s2.style.opacity = s3.style.transform = '';
    }
  });

  /* Cerrar el menú al hacer clic en cualquier enlace */
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.querySelectorAll('span').forEach(s => {
        s.style.transform = s.style.opacity = '';
      });
    });
  });
}

/* --- Marcar el enlace activo según la página actual --- */
if (navLinks) {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.querySelectorAll('a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    if (href === current) a.classList.add('active');
  });
}

/* --- Agregar sombra al navbar cuando el usuario hace scroll --- */
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}


/* ──────────────────────────────────────
   SECCIÓN 2: SCROLL REVEAL
   Hace aparecer elementos con animación
   cuando el usuario llega a ellos
   al hacer scroll hacia abajo
   ────────────────────────────────────── */
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

if (revealEls.length) {
  /* Observa cada elemento; cuando entra en pantalla, le agrega la clase 'visible' */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); /* Deja de observarlo después de animarlo */
      }
    });
  }, { threshold: 0.14 }); /* Se activa cuando el 14% del elemento es visible */

  revealEls.forEach(el => observer.observe(el));
}


/* ──────────────────────────────────────
   SECCIÓN 3: SLIDER DE GALERÍA
   Solo se activa en galeria.html
   Controla las flechas, los puntos
   de navegación y el autoplay
   ────────────────────────────────────── */
const track    = document.getElementById('sliderTrack');
const dotsWrap = document.getElementById('sliderDots');

if (track && dotsWrap) {
  const slides = Array.from(track.querySelectorAll('.slide'));
  let currentSlide = 0;
  let autoTimer    = null;

  /* --- Crear los puntos de navegación dinámicamente --- */
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Ir a imagen ' + (i + 1));
    dot.addEventListener('click', () => { goTo(i); resetAutoplay(); });
    dotsWrap.appendChild(dot);
  });

  /* --- Función principal: mover el slider al índice indicado --- */
  function goTo(n) {
    currentSlide = ((n % slides.length) + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;

    /* Actualizar el punto activo */
    dotsWrap.querySelectorAll('.slider-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  /* --- Botones de flecha anterior y siguiente --- */
  document.getElementById('sliderPrev')?.addEventListener('click', () => { goTo(currentSlide - 1); resetAutoplay(); });
  document.getElementById('sliderNext')?.addEventListener('click', () => { goTo(currentSlide + 1); resetAutoplay(); });

  /* --- Autoplay: cambia de imagen cada 4 segundos --- */
  function startAutoplay() { autoTimer = setInterval(() => goTo(currentSlide + 1), 4000); }
  function resetAutoplay() { clearInterval(autoTimer); startAutoplay(); }

  startAutoplay();

  /* --- Soporte táctil: deslizar con el dedo en móvil --- */
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    /* Si el deslizamiento supera 40px, cambia de slide */
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? currentSlide + 1 : currentSlide - 1); resetAutoplay(); }
  });
}


/* ──────────────────────────────────────
   SECCIÓN 4: FORMULARIO DE CONTACTO
   Solo se activa si existe el botón
   de envío en la página actual
   Valida los campos y muestra mensajes
   ────────────────────────────────────── */
const btnEnviar = document.getElementById('btnEnviar');
const formMsg   = document.getElementById('formMsg');

if (btnEnviar && formMsg) {
  btnEnviar.addEventListener('click', () => {
    /* Obtener los valores de todos los campos */
    const nombre   = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const email    = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const mensaje  = document.getElementById('mensaje').value.trim();

    /* Limpiar mensaje anterior */
    formMsg.style.display = 'none';
    formMsg.className = 'form-msg';

    /* --- Validación: todos los campos deben estar llenos --- */
    if (!nombre || !apellido || !telefono || !email || !mensaje) {
      mostrarMsg('⚠ Por favor, completa todos los campos antes de enviar.', 'error');
      return;
    }

    /* --- Validación: formato de correo electrónico --- */
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      mostrarMsg('⚠ Por favor, ingresa un correo electrónico válido.', 'error');
      return;
    }

    /* --- Estado de carga mientras se "envía" --- */
    btnEnviar.textContent   = 'Enviando...';
    btnEnviar.disabled      = true;
    btnEnviar.style.opacity = '0.7';

    /* --- Simular envío y mostrar mensaje de éxito --- */
    setTimeout(() => {
      mostrarMsg('✓ ¡Mensaje enviado con éxito! Nos pondremos en contacto muy pronto.', 'success');

      /* Limpiar los campos del formulario */
      ['nombre', 'apellido', 'email', 'mensaje'].forEach(id => {
        document.getElementById(id).value = '';
      });

      /* Restaurar el botón */
      btnEnviar.textContent   = 'Enviar Mensaje';
      btnEnviar.disabled      = false;
      btnEnviar.style.opacity = '1';
    }, 1400);
  });

  /* --- Función auxiliar para mostrar mensajes de error o éxito --- */
  function mostrarMsg(texto, tipo) {
    formMsg.textContent = texto;
    formMsg.classList.add(tipo);
    formMsg.style.display = 'block';
  }
}