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
   ────────────────────────────────────── */
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


/* ──────────────────────────────────────
   SECCIÓN 3: SLIDER DE GALERÍA
   ────────────────────────────────────── */
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
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) { goTo(diff > 0 ? currentSlide + 1 : currentSlide - 1); resetAutoplay(); }
  });
}


/* ──────────────────────────────────────
   SECCIÓN 4: VALIDACIONES DE FORMULARIOS

   Utilidades de validación compartidas
   ────────────────────────────────────── */

/**
 * Muestra el error de un campo específico
 * @param {HTMLElement} campo - El input/select/textarea
 * @param {string} mensaje - Texto del error a mostrar
 */
function mostrarErrorCampo(campo, mensaje) {
  campo.classList.add('campo-error');
  campo.classList.remove('campo-ok');

  // Buscar o crear el span de error debajo del campo
  let msgEl = campo.parentElement.querySelector('.campo-msg');
  if (!msgEl) {
    msgEl = document.createElement('span');
    msgEl.className = 'campo-msg';
    campo.parentElement.appendChild(msgEl);
  }
  msgEl.textContent = '⚠ ' + mensaje;
  msgEl.classList.add('visible');
}

/**
 * Marca un campo como válido y oculta el error
 * @param {HTMLElement} campo
 */
function marcarCampoOk(campo) {
  campo.classList.remove('campo-error');
  campo.classList.add('campo-ok');
  const msgEl = campo.parentElement.querySelector('.campo-msg');
  if (msgEl) msgEl.classList.remove('visible');
}

/**
 * Valida un campo de nombre/texto (solo letras, mín 2 chars)
 * @param {HTMLElement} campo
 * @param {string} etiqueta - Nombre del campo para el mensaje
 * @returns {boolean}
 */
function validarNombre(campo, etiqueta) {
  const val = campo.value.trim();
  if (!val) {
    mostrarErrorCampo(campo, `El ${etiqueta} es obligatorio.`);
    return false;
  }
  if (val.length < 2) {
    mostrarErrorCampo(campo, `El ${etiqueta} debe tener al menos 2 caracteres.`);
    return false;
  }
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/.test(val)) {
    mostrarErrorCampo(campo, `El ${etiqueta} solo puede contener letras.`);
    return false;
  }
  marcarCampoOk(campo);
  return true;
}

/**
 * Valida un email
 * @param {HTMLElement} campo
 * @returns {boolean}
 */
function validarEmail(campo) {
  const val = campo.value.trim();
  if (!val) {
    mostrarErrorCampo(campo, 'El correo electrónico es obligatorio.');
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    mostrarErrorCampo(campo, 'Ingresa un correo válido (ej: tu@correo.com).');
    return false;
  }
  marcarCampoOk(campo);
  return true;
}

/**
 * Valida un número de teléfono (7–15 dígitos, puede tener +, espacios, guiones)
 * @param {HTMLElement} campo
 * @returns {boolean}
 */
function validarTelefono(campo) {
  const val = campo.value.trim();
  if (!val) {
    mostrarErrorCampo(campo, 'El teléfono es obligatorio.');
    return false;
  }
  const soloDigitos = val.replace(/[\s\-\+\(\)]/g, '');
  if (!/^\d{7,15}$/.test(soloDigitos)) {
    mostrarErrorCampo(campo, 'Ingresa un teléfono válido (9 a 15 dígitos).');
    return false;
  }
  marcarCampoOk(campo);
  return true;
}

/**
 * Valida que un campo no esté vacío
 * @param {HTMLElement} campo
 * @param {string} etiqueta
 * @returns {boolean}
 */
function validarRequerido(campo, etiqueta) {
  const val = campo.value.trim();
  if (!val || val === '') {
    mostrarErrorCampo(campo, `Por favor, selecciona o completa ${etiqueta}.`);
    return false;
  }
  marcarCampoOk(campo);
  return true;
}

/**
 * Valida que un textarea tenga contenido mínimo
 * @param {HTMLElement} campo
 * @param {number} minChars
 * @returns {boolean}
 */
function validarMensaje(campo, minChars = 10) {
  const val = campo.value.trim();
  if (!val) {
    mostrarErrorCampo(campo, 'El mensaje es obligatorio.');
    return false;
  }
  if (val.length < minChars) {
    mostrarErrorCampo(campo, `El mensaje debe tener al menos ${minChars} caracteres.`);
    return false;
  }
  marcarCampoOk(campo);
  return true;
}

/**
 * Valida que una fecha no sea pasada
 * @param {HTMLElement} campo
 * @returns {boolean}
 */
function validarFecha(campo) {
  const val = campo.value;
  if (!val) {
    mostrarErrorCampo(campo, 'La fecha de visita es obligatoria.');
    return false;
  }
  const seleccionada = new Date(val);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (seleccionada < hoy) {
    mostrarErrorCampo(campo, 'La fecha no puede ser en el pasado.');
    return false;
  }
  marcarCampoOk(campo);
  return true;
}

/**
 * Valida un número dentro de un rango
 * @param {HTMLElement} campo
 * @param {number} min
 * @param {number} max
 * @param {string} etiqueta
 * @returns {boolean}
 */
function validarNumero(campo, min, max, etiqueta) {
  const val = parseInt(campo.value, 10);
  if (isNaN(val) || campo.value.trim() === '') {
    mostrarErrorCampo(campo, `${etiqueta} es obligatorio.`);
    return false;
  }
  if (val < min || val > max) {
    mostrarErrorCampo(campo, `${etiqueta} debe ser entre ${min} y ${max}.`);
    return false;
  }
  marcarCampoOk(campo);
  return true;
}


/* ── VALIDACIÓN EN TIEMPO REAL ──
   Al salir de cada campo (blur), se valida
   para dar retroalimentación inmediata */
function activarValidacionEnTiempoReal(campo, fnValidar) {
  campo.addEventListener('blur', fnValidar);
  campo.addEventListener('input', () => {
    if (campo.classList.contains('campo-error')) fnValidar();
  });
}


/* ──────────────────────────────────────
   FORMULARIO DE VISITAS (visitas.html)
   Campos: nombre, email, telefono,
           fecha_visita, cantidad_personas,
           interes_compra
   El form es manejado por Flask (POST),
   pero validamos en el cliente primero
   para evitar envíos incorrectos
   ────────────────────────────────────── */
const formVisitas = document.getElementById('formVisitas');

if (formVisitas) {
  const vNombre    = document.getElementById('nombre');
  const vEmail     = document.getElementById('email');
  const vTelefono  = document.getElementById('telefono');
  const vFecha     = document.getElementById('fecha_visita');
  const vCantidad  = document.getElementById('cantidad_personas');
  const vInteres   = document.getElementById('interes_compra');

  // Poner fecha mínima en el campo de fecha (hoy)
  if (vFecha) {
    const hoy = new Date().toISOString().split('T')[0];
    vFecha.setAttribute('min', hoy);
  }

  // Validación en tiempo real
  if (vNombre)   activarValidacionEnTiempoReal(vNombre,   () => validarNombre(vNombre, 'nombre'));
  if (vEmail)    activarValidacionEnTiempoReal(vEmail,    () => validarEmail(vEmail));
  if (vTelefono) activarValidacionEnTiempoReal(vTelefono, () => validarTelefono(vTelefono));
  if (vFecha)    activarValidacionEnTiempoReal(vFecha,    () => validarFecha(vFecha));
  if (vCantidad) activarValidacionEnTiempoReal(vCantidad, () => validarNumero(vCantidad, 1, 20, 'El número de visitantes'));
  if (vInteres)  activarValidacionEnTiempoReal(vInteres,  () => validarRequerido(vInteres, 'un producto de interés'));

  formVisitas.addEventListener('submit', function(e) {
    const resultados = [
      vNombre   ? validarNombre(vNombre, 'nombre')                          : true,
      vEmail    ? validarEmail(vEmail)                                       : true,
      vTelefono ? validarTelefono(vTelefono)                                 : true,
      vFecha    ? validarFecha(vFecha)                                       : true,
      vCantidad ? validarNumero(vCantidad, 1, 20, 'El número de visitantes') : true,
      vInteres  ? validarRequerido(vInteres, 'un producto de interés')       : true,
    ];

    const hayErrores = resultados.includes(false);

    if (hayErrores) {
      e.preventDefault(); // Bloquear el envío al servidor
      const primerError = formVisitas.querySelector('.campo-error');
      if (primerError) {
        primerError.focus();
        primerError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
    // Si todo está bien, el formulario se envía normalmente a Flask
  });
}


/* ──────────────────────────────────────
   SECCIÓN 5: CHAT IA (granada-chat.html)
   Respuestas por palabras clave ampliadas
   ────────────────────────────────────── */
const chatForm  = document.getElementById('chatForm');
const chatBox   = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');

if (chatForm && chatBox && userInput) {

  /* ── BASE DE CONOCIMIENTO DEL CHAT ──
     Cada entrada tiene:
     - keywords: palabras clave a detectar (OR)
     - respuestas: array de respuestas (se elige aleatoriamente
       para que el bot no suene repetitivo) */
  const conocimiento = [

    /* Saludos */
    {
      keywords: ['hola', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'saludos', 'buenas', 'qué tal', 'que tal', 'cómo estás', 'como estas'],
      respuestas: [
        '¡Hola! Qué alegría tenerte aquí. Soy el asistente virtual de AGREHIMA, especializado en granadas. ¿Quieres saber sobre nuestros productos, beneficios, cómo visitarnos o algo más?',
        '¡Bienvenido! Estoy aquí para contarte todo sobre nuestras granadas frescas. Cuéntame, ¿en qué puedo ayudarte hoy?',
        '¡Buenas! Espero que estés teniendo un excelente día. Soy tu asistente de Granadas Frescas. Puedo orientarte sobre nuestros cultivos, productos y visitas al huerto. ',
      ]
    },

    /* Beneficios / Salud */
    {
      keywords: ['beneficio', 'salud', 'bueno para', 'propiedades', 'nutrient', 'vitamina', 'mineral', 'antioxidante', 'sano', 'saludable', 'para qué sirve', 'para que sirve'],
      respuestas: [
        '¡Las granadas son un superalimento increíble! Son ricas en antioxidantes (polifenoles y ácido elágico) que protegen tus células. También contienen vitaminas C, B6 y K, además de potasio, magnesio y zinc. Ayudan a reducir la presión arterial, mejorar la digestión y fortalecer el sistema inmunológico.',
        'Nuestra granada tiene múltiples beneficios: mejora la salud cardiovascular reduciendo el colesterol malo, combate la inflamación, favorece la memoria y la concentración, y es excelente para la piel gracias a sus antioxidantes. ¡Es una fruta completa!',
        'Si hablamos de salud, la granada es una de las frutas más poderosas. Estudios muestran que sus antioxidantes son hasta 3 veces más potentes que los del vino tinto o el té verde. Además, ayuda con la presión arterial y tiene propiedades antiinflamatorias naturales.',
      ]
    },

    /* Vitaminas específicas */
    {
      keywords: ['vitamina c', 'vitamina a', 'vitamina d', 'vitamina b'],
      respuestas: [
        'La granada contiene vitamina C, que refuerza el sistema inmunológico; vitamina B6, importante para el metabolismo; y vitamina K, esencial para la coagulación sanguínea. Es una fuente natural muy completa. ¿Te gustaría saber más sobre alguna en particular?',
        'Nuestras granadas frescas conservan sus vitaminas naturales gracias a que las cosechamos en el momento óptimo de madurez. La vitamina C en especial es abundante y ayuda a absorber mejor el hierro de otros alimentos.',
      ]
    },

    /* Productos */
    {
      keywords: ['producto', 'precio', 'venden', 'venta', 'comprar', 'adquirir', 'cuánto cuesta', 'cuanto cuesta', 'oferta', 'catálogo', 'catalogo', 'disponible'],
      respuestas: [
        'Tenemos tres productos principales:  Granada Entera Premium (seleccionada, jugosa y perfecta para consumo directo),  Granos Listos para Usar (desgranados, ideales para ensaladas, smoothies y postres) y  Granada de Segunda (muy sabrosa, perfecta para jugos y recetas). ¡Visita nuestra sección de Productos para ver más detalles!',
        'Ofrecemos granadas frescas recién cosechadas con los mejores estándares de calidad. Contamos con presentaciones en fruta entera por jabas, granos listos para usar, y cajas premium para regalo o distribución empresarial. ¿Te interesa algún volumen en especial?',
        'Nuestros productos van desde granadas enteras premium hasta presentaciones listas para usar. Si buscas algo para consumo personal, el kilo de granos es perfecto. Si quieres algo para negocio o evento, tenemos cajas premium. Contáctanos al +51 931127110 para coordinar.',
      ]
    },

    /* Jugos */
    {
      keywords: ['jugo', 'zumo', 'bebida', 'refresco', 'licuado', 'smoothie'],
      respuestas: [
        'El jugo de granada es una de las bebidas más nutritivas que existen. Con solo media granada obtienes una porción generosa de jugo natural, lleno de antioxidantes. Lo puedes hacer solo, mezclado con naranja, o añadirlo a tus smoothies. ¿Quieres una receta?',
        'Para hacer un buen jugo de granada, te recomendamos cortar la fruta por la mitad y presionarla como si fuera una naranja. También puedes desgranar y licuar sin cáscara. El resultado es un jugo intenso y delicioso. Nosotros también vendemos granos listos para que sea más fácil.',
      ]
    },

    /* Recetas */
    {
      keywords: ['receta', 'cocinar', 'preparar', 'usar', 'cómo se usa', 'como se usa', 'ensalada', 'postre'],
      respuestas: [
        'Los granos de granada son muy versátiles. Puedes agregarlos a:  Ensaladas (con espinaca, queso feta y nueces),  Postres (yogurt, helado, panna cotta),  Jugos y smoothies,  Platos salados como arroz con pollo o cuscús. ¿Quieres que te cuente alguna receta específica?',
        'Una receta fácil y deliciosa: ensalada de espinaca con granos de granada, queso fresco, nueces y un aderezo de limón con miel. Es refrescante, nutritiva y lista en 5 minutos. Los granos de granada son el toque final perfecto para cualquier plato.',
        'Para postres, una idea fantástica es panna cotta con coulis de granada: prepara la panna cotta con crema y gelatina, y para el coulis solo licúa los granos con un poco de azúcar. El color rojo intenso hace que quede espectacular para presentar.',
      ]
    },

    /* Temporada / Cosecha */
    {
      keywords: ['temporada', 'cosecha', 'cuándo', 'cuando', 'época', 'meses', 'estación', 'estacion', 'producción', 'produccion'],
      respuestas: [
        'La cosecha principal de nuestras granadas se da entre los meses de marzo y junio, aunque dependiendo del clima podemos tener producción hasta agosto. Durante este periodo nuestras granadas están en su punto óptimo de sabor y jugosidad.',
        'La granada es una fruta de temporada. En nuestra granja cosechamos principalmente en los primeros meses del año y hasta mediados de año. Te recomendamos coordinar tu visita o compra con anticipación para asegurarte el mejor producto de la cosecha.',
      ]
    },

    /* Visitas */
    {
      keywords: ['visita', 'visitar', 'tour', 'recorrido', 'conocer', 'granja', 'huerto', 'campo', 'agendar', 'reserva', 'reservar'],
      respuestas: [
        '¡Nos encantaría recibirte! Puedes agendar una visita guiada al huerto llenando el formulario en nuestra sección de Visitas. Las visitas incluyen recorrido por el campo, explicación del proceso de cultivo y cosecha, y una degustación de nuestros productos. ¡Es una experiencia inolvidable!',
        'Las visitas al huerto son una de las experiencias más especiales que ofrecemos. Puedes venir solo, en pareja, con familia o grupo escolar. Tenemos capacidad para hasta 20 personas por visita. Para reservar, ve a la sección Visitas y llena el formulario con tu fecha preferida.',
        'Para organizar una visita, necesitamos que completes el formulario de reserva con tu nombre, fecha, número de personas y qué productos te interesan. Nuestro equipo confirmará tu reserva y te dará todos los detalles de llegada. ¿Quieres ir directamente al formulario?',
      ]
    },

    /* Ubicación / Dirección */
    {
      keywords: ['donde', 'dirección', 'direccion', 'ubicación', 'ubicacion', 'cómo llegar', 'como llegar', 'mapa', 'lugar', 'dónde están', 'donde estan', 'localización', 'localizacion'],
      respuestas: [
        'Nos encontramos en la Calle Frutal 123, Valle Verde. Es una zona agrícola muy tranquila, rodeada de naturaleza. Para llegar, puedes guiarte por Google Maps buscando "Granadas Frescas Valle Verde". Si tienes dudas sobre el camino, llámanos al +51 931127110.',
        'Estamos ubicados en Valle Verde, en la Calle Frutal 123. Es un lugar privilegiado con tierra fértil perfecta para el cultivo de granadas. Si planeas visitarnos, te recomendamos venir en la mañana cuando el clima es más fresco y podrás ver la cosecha en acción.',
      ]
    },

    /* Contacto */
    {
      keywords: ['contacto', 'teléfono', 'telefono', 'whatsapp', 'llamar', 'correo', 'email', 'escribir', 'comunicar'],
      respuestas: [
        'Puedes contactarnos por:  Teléfono/WhatsApp: +51 931127110 ·  Correo: valleverde@gmail.com ·  Visita presencial: Calle Frutal 123, Valle Verde. Estamos disponibles de lunes a sábado de 8am a 5pm.',
        '¡Estamos disponibles para atenderte! Escríbenos al WhatsApp +51 931127110 o mándanos un correo a valleverde@gmail.com. Si prefieres una atención más directa, pasa por nuestro local en la Calle Frutal 123, Valle Verde.',
      ]
    },

    /* Cultivo / Agricultura */
    {
      keywords: ['cultivo', 'cultivar', 'plantar', 'árbol', 'arbol', 'planta', 'semilla', 'riego', 'orgánico', 'organico', 'natural', 'sostenible', 'fertilizante'],
      respuestas: [
        'Nuestras granadas se cultivan de forma natural y sostenible. Utilizamos técnicas de riego eficiente, evitamos pesticidas agresivos y cuidamos la salud del suelo con compost orgánico. Cada árbol de granada recibe atención personalizada para asegurar la mejor calidad de fruto.',
        'El árbol de granada es resistente y vive hasta 200 años si se le cuida bien. En nuestra granja lo regamos de manera controlada, evitando el exceso de agua. La fruta tarda entre 6 y 7 meses desde la floración hasta estar lista para cosechar. Es un proceso natural que requiere paciencia y dedicación.',
        'Nos orgullecemos de usar prácticas agrícolas responsables. No usamos colorantes ni conservantes artificiales. Nuestras granadas crecen bajo el sol, con agua natural y el cuidado de nuestro equipo experimentado. Lo que llega a tu mesa es 100% natural.',
      ]
    },

    /* AGREHIMA */
    {
      keywords: ['agrehima', 'empresa', 'quiénes son', 'quienes son', 'nosotros', 'historia', 'fundación', 'fundacion', 'marca'],
      respuestas: [
        'AGREHIMA es la asociación detrás de Granadas Frescas. Nacimos del amor por la tierra y la tradición agrícola de Valle Verde. Nuestra misión es ofrecer granadas de la más alta calidad, cultivadas responsablemente, para brindar salud y sabor natural a cada hogar.',
        'Somos una empresa familiar comprometida con la calidad y el medio ambiente. Desde nuestros inicios, hemos trabajado de la mano con la comunidad local para producir granadas frescas con los mejores estándares. Nuestra historia es una de dedicación, esfuerzo y pasión por la fruta.',
      ]
    },

    /* Conservación */
    {
      keywords: ['conservar', 'guardar', 'durar', 'refrigerar', 'nevera', 'frigorífico', 'cuánto dura', 'cuanto dura', 'almacenar'],
      respuestas: [
        'Una granada entera puede durar hasta 1 mes en el refrigerador o 2 semanas a temperatura ambiente en un lugar fresco y seco. Una vez abierta, los granos se conservan en un recipiente hermético en la nevera por unos 5 días. También puedes congelar los granos hasta por 12 meses.',
        'Para conservar mejor tu granada: guárdala en un lugar fresco y con buena ventilación si la vas a consumir pronto. Si vas a tardar más, el refrigerador es tu mejor aliado. Los granos ya separados duran menos, así que te recomendamos desgranarlos justo antes de consumirlos.',
      ]
    },

    /* Despedida */
    {
      keywords: ['adios', 'adiós', 'chau', 'chao', 'hasta luego', 'bye', 'gracias', 'muchas gracias', 'ok gracias'],
      respuestas: [
        '¡Hasta luego! Fue un placer ayudarte. Si tienes más preguntas sobre nuestras granadas o quieres organizar una visita, aquí estaremos. ¡Que disfrutes el día! ',
        '¡Gracias a ti por tu interés! Recuerda que puedes encontrarnos en la Calle Frutal 123 o llamarnos al +51 931127110. ¡Que tengas un excelente día!',
        '¡Hasta pronto! Espero haber sido de ayuda. No dudes en volver si tienes más preguntas. ¡Nuestras granadas te esperan! ',
      ]
    },

    /* Precio / Costo */
    {
      keywords: ['cuánto vale', 'cuanto vale', 'costo', 'tarifa', 'precio', 'económico', 'economico', 'barato', 'caro'],
      respuestas: [
        'Para conocer nuestros precios actualizados y disponibilidad, te recomendamos contactarnos directamente al WhatsApp +51 931127110 o al correo valleverde@gmail.com. Los precios varían según la temporada y el volumen de compra. ¡Con gusto te cotizamos!',
        'Manejamos precios competitivos y justos que varían según la presentación (fruta entera, granos o cajas premium) y la cantidad que necesites. Para una cotización personalizada, escríbenos al +51 931127110.',
      ]
    },
  ];

  /* Respuestas cuando no se entiende la consulta */
  const respuestasNoEntiendo = [
    'Hmm, no estoy seguro de entender bien tu pregunta. Puedo ayudarte con información sobre los beneficios de la granada, nuestros productos, cómo visitarnos o cómo contactarnos. ¿Sobre cuál de estos temas quieres saber más?',
    'No tengo información específica sobre eso aún, pero puedo contarte sobre nuestros cultivos, productos, beneficios de la granada o cómo agendar una visita. ¿Qué te interesa?',
    'Esa pregunta me supera un poco, pero sigo aprendiendo.  Lo que sí puedo contarte es todo sobre nuestras granadas: sus propiedades, cómo se cultivan, qué productos ofrecemos y cómo visitarnos. ¿Te cuento algo de eso?',
    'No encontré una respuesta exacta para eso. ¿Quizás puedes reformular la pregunta? También puedes contactarnos directamente al +51 931127110 para una respuesta más completa.',
  ];

  /**
   * Busca la mejor respuesta para el texto del usuario
   * @param {string} texto
   * @returns {string}
   */
  function obtenerRespuesta(texto) {
    const q = texto.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes para comparación
      .replace(/[¿¡]/g, '');

    for (const entrada of conocimiento) {
      const match = entrada.keywords.some(kw => {
        const kwNorm = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return q.includes(kwNorm);
      });
      if (match) {
        // Elegir una respuesta aleatoria del array
        const idx = Math.floor(Math.random() * entrada.respuestas.length);
        return entrada.respuestas[idx];
      }
    }

    // Sin coincidencia: respuesta genérica aleatoria
    const idx = Math.floor(Math.random() * respuestasNoEntiendo.length);
    return respuestasNoEntiendo[idx];
  }

  /* Enviar mensaje al presionar el formulario */
  chatForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const texto = userInput.value.trim();
    if (!texto) return;

    // Mostrar mensaje del usuario
    appendMessage(texto, 'user');
    userInput.value = '';

    // Mostrar indicador de "escribiendo..."
    const typing = appendMessage('Granada Chat está escribiendo...', 'typing');

    // Responder con delay para simular que piensa
    const delay = 700 + Math.random() * 600; // entre 700ms y 1300ms
    setTimeout(() => {
      chatBox.removeChild(typing);
      const respuesta = obtenerRespuesta(texto);
      appendMessage(respuesta, 'bot');
    }, delay);
  });

  /**
   * Crea y agrega una burbuja de mensaje al chat
   * @param {string} text
   * @param {string} sender - 'user', 'bot' o 'typing'
   * @returns {HTMLElement} El elemento creado
   */
  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return msgDiv;
  }
}
