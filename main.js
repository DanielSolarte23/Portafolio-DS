// ===================================
// Intersection Observer para Animaciones
// ===================================
const observerOptions = {
  threshold: 0.15,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Observar todos los elementos con clases reveal
document.addEventListener('DOMContentLoaded', () => {
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  revealElements.forEach(el => observer.observe(el));
});

// ===================================
// Parallax Effect para Hero
// ===================================
const parallaxBg = document.querySelector('.hero-parallax-bg');
let ticking = false;

function updateParallax() {
  const scrolled = window.pageYOffset;
  const parallaxSpeed = 0.5;
  
  if (parallaxBg) {
    parallaxBg.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
  }
  
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    window.requestAnimationFrame(updateParallax);
    ticking = true;
  }
});

// ===================================
// Smooth Scroll para Enlaces Internos
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    
    if (target) {
      const navHeight = document.querySelector('.nav').offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
      
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===================================
// Navegación Activa en Scroll
// ===================================
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

function highlightNavigation() {
  const scrollY = window.pageYOffset;
  
  sections.forEach(section => {
    const sectionHeight = section.offsetHeight;
    const sectionTop = section.offsetTop - 150;
    const sectionId = section.getAttribute('id');
    
    if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });
}

window.addEventListener('scroll', highlightNavigation);

// ===================================
// Sistema de Alertas Mejorado
// ===================================

// Crear contenedor de alertas si no existe
function createAlertContainer() {
  let container = document.getElementById('alert-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'alert-container';
    container.className = 'alert-container';
    document.body.appendChild(container);
  }
  return container;
}

// Función para mostrar alertas
function showAlert(message, type = 'success', duration = 5000) {
  const container = createAlertContainer();
  
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  
  alert.innerHTML = `
    <div class="alert-icon">${icon}</div>
    <div class="alert-content">
      <p class="alert-message">${message}</p>
    </div>
    <button class="alert-close" aria-label="Cerrar alerta">&times;</button>
  `;
  
  // Agregar al contenedor
  container.appendChild(alert);
  
  // Animar entrada
  setTimeout(() => {
    alert.classList.add('alert-show');
  }, 10);
  
  // Botón de cerrar
  const closeBtn = alert.querySelector('.alert-close');
  closeBtn.addEventListener('click', () => {
    closeAlert(alert);
  });
  
  // Auto-cerrar después de la duración especificada
  if (duration > 0) {
    setTimeout(() => {
      closeAlert(alert);
    }, duration);
  }
  
  return alert;
}

// Cerrar alerta con animación
function closeAlert(alert) {
  alert.classList.remove('alert-show');
  alert.classList.add('alert-hide');
  
  setTimeout(() => {
    alert.remove();
  }, 300);
}

// ===================================
// Validación y Envío de Formulario Mejorado
// ===================================
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const formInputs = {
    name: document.getElementById('name'),
    email: document.getElementById('email'),
    subject: document.getElementById('subject'),
    message: document.getElementById('message')
  };
  
  const formErrors = {
    name: document.getElementById('name-error'),
    email: document.getElementById('email-error'),
    subject: document.getElementById('subject-error'),
    message: document.getElementById('message-error')
  };
  
  // Botón submit
  const submitBtn = contactForm.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : 'Enviar Mensaje';
  
  // Validaciones
  const validators = {
    name: (value) => {
      if (!value.trim()) return 'El nombre es requerido';
      if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
      if (value.trim().length > 100) return 'El nombre es demasiado largo';
      if (!/^[a-záéíóúñü\s]+$/i.test(value.trim())) return 'El nombre contiene caracteres inválidos';
      return '';
    },
    
    email: (value) => {
      if (!value.trim()) return 'El email es requerido';
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return 'Email inválido';
      if (value.trim().length > 254) return 'Email demasiado largo';
      return '';
    },
    
    subject: (value) => {
      if (!value.trim()) return 'El asunto es requerido';
      if (value.trim().length < 3) return 'El asunto debe tener al menos 3 caracteres';
      if (value.trim().length > 200) return 'El asunto es demasiado largo';
      return '';
    },
    
    message: (value) => {
      if (!value.trim()) return 'El mensaje es requerido';
      if (value.trim().length < 10) return 'El mensaje debe tener al menos 10 caracteres';
      if (value.trim().length > 5000) return 'El mensaje es demasiado largo';
      return '';
    }
  };
  
  // Validar campo individual
  function validateField(fieldName) {
    const input = formInputs[fieldName];
    const errorElement = formErrors[fieldName];
    const errorMessage = validators[fieldName](input.value);
    
    if (errorMessage) {
      errorElement.textContent = errorMessage;
      input.setAttribute('aria-invalid', 'true');
      input.style.borderColor = '#ff6b6b';
      return false;
    } else {
      errorElement.textContent = '';
      input.removeAttribute('aria-invalid');
      input.style.borderColor = '';
      return true;
    }
  }
  
  // Agregar validación en tiempo real
  Object.keys(formInputs).forEach(fieldName => {
    const input = formInputs[fieldName];
    
    input.addEventListener('blur', () => {
      validateField(fieldName);
    });
    
    input.addEventListener('input', () => {
      if (formErrors[fieldName].textContent) {
        validateField(fieldName);
      }
    });
  });
  
  // Validar y enviar formulario
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validar todos los campos
    let isValid = true;
    Object.keys(formInputs).forEach(fieldName => {
      if (!validateField(fieldName)) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      // Mostrar alerta de error
      showAlert('Por favor, corrige los errores en el formulario', 'error', 4000);
      
      // Enfocar el primer campo con error
      const firstError = Object.keys(formInputs).find(
        fieldName => formErrors[fieldName].textContent
      );
      if (firstError) {
        formInputs[firstError].focus();
      }
      return;
    }
    
    // Deshabilitar botón y mostrar loading
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <span class="spinner"></span>
        Enviando...
      `;
    }
    
    try {
      // Enviar formulario
      const formData = new FormData(contactForm);
      
      const response = await fetch('/contact', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        // Éxito
        showAlert('¡Mensaje enviado correctamente! Te responderé pronto. 🎉', 'success', 6000);
        
        // Limpiar formulario
        contactForm.reset();
        
        // Hacer scroll suave hacia arriba
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
        
      } else {
        // Error del servidor
        const errorText = await response.text();
        showAlert('Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.', 'error', 5000);
      }
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      showAlert('Error de conexión. Por favor, verifica tu internet e intenta nuevamente.', 'error', 5000);
    } finally {
      // Restaurar botón
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });
}

// ===================================
// Verificar mensajes del servidor al cargar
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  // Buscar mensajes de éxito o error en la página
  const successMessage = document.querySelector('[data-success-message]');
  const errorMessage = document.querySelector('[data-error-message]');
  
  if (successMessage) {
    const message = successMessage.getAttribute('data-success-message');
    showAlert(message, 'success', 6000);
    
    // Hacer scroll suave hacia arriba
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
  }
  
  if (errorMessage) {
    const message = errorMessage.getAttribute('data-error-message');
    showAlert(message, 'error', 5000);
  }
});

// ===================================
// Cursor Trail Effect (opcional, sutil)
// ===================================
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function animateCursor() {
  const speed = 0.1;
  
  cursorX += (mouseX - cursorX) * speed;
  cursorY += (mouseY - cursorY) * speed;
  
  requestAnimationFrame(animateCursor);
}

animateCursor();

// ===================================
// Project Cards: Efecto Hover con Trail
// ===================================
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
  card.addEventListener('mouseenter', function() {
    this.style.setProperty('--mouse-x', '0px');
    this.style.setProperty('--mouse-y', '0px');
  });
  
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.style.setProperty('--mouse-x', `${x}px`);
    this.style.setProperty('--mouse-y', `${y}px`);
  });
});

// ===================================
// Botones: Ripple Effect
// ===================================
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
  button.addEventListener('click', function(e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add('ripple');
    
    this.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  });
});

// ===================================
// Navegación: Background al Scroll
// ===================================
const nav = document.querySelector('.nav');
let lastScrollY = window.pageYOffset;

window.addEventListener('scroll', () => {
  const currentScrollY = window.pageYOffset;
  
  if (currentScrollY > 100) {
    nav.style.background = 'rgba(10, 10, 10, 0.98)';
    nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.5)';
  } else {
    nav.style.background = 'rgba(10, 10, 10, 0.95)';
    nav.style.boxShadow = 'none';
  }
  
  lastScrollY = currentScrollY;
});

// ===================================
// Lazy Loading para Imágenes
// ===================================
const images = document.querySelectorAll('img[loading="lazy"]');

if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// ===================================
// Detectar Preferencia de Movimiento Reducido
// ===================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
  // Desactivar animaciones si el usuario prefiere movimiento reducido
  document.body.style.setProperty('--transition-fast', '0s');
  document.body.style.setProperty('--transition-normal', '0s');
  document.body.style.setProperty('--transition-slow', '0s');
}

// ===================================
// Animación de Números (Contador)
// ===================================
function animateValue(element, start, end, duration) {
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    element.textContent = Math.floor(progress * (end - start) + start);
    if (progress < 1) {
      window.requestAnimationFrame(step);
    }
  };
  window.requestAnimationFrame(step);
}

// ===================================
// Typing Effect para Hero (opcional)
// ===================================
function typeWriter(element, text, speed = 100) {
  let i = 0;
  element.textContent = '';
  
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  
  type();
}

// Aplicar efecto typing al subtítulo del hero (comentado por defecto)
// const heroSubtitle = document.querySelector('.hero-subtitle');
// if (heroSubtitle) {
//   const originalText = heroSubtitle.textContent;
//   typeWriter(heroSubtitle, originalText, 50);
// }

// ===================================
// Performance: Debounce para Scroll
// ===================================
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Usar debounce para eventos de scroll costosos
const debouncedHighlight = debounce(highlightNavigation, 100);
window.addEventListener('scroll', debouncedHighlight);

// ===================================
// Accesibilidad: Trap Focus en Modal
// ===================================
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
    
    if (e.key === 'Escape') {
      // Cerrar modal si existe
      element.style.display = 'none';
    }
  });
}



// ===================================
// Console Art (Easter Egg)
// ===================================
console.log('%c¡Hola!', 'font-size: 20px; font-weight: bold; color: #ffd700;');
console.log('%cEste portafolio fue construido usando:', 'font-size: 14px; color: #a0a0a0;');
console.log('%c• HTML5 + Handlebars\n• CSS3 (Variables nativas)\n• Vanilla JavaScript\n• Node.js + Express\n• Nodemailer', 'font-size: 12px; color: #e0e0e0;');
console.log('%c\n¿Interesado? ¡Contáctame!', 'font-size: 14px; font-weight: bold; color: #ffd700;');

// ===================================
// Inicialización
// ===================================
document.addEventListener('DOMContentLoaded', () => {
  // console.log('Portfolio cargado correctamente');
  
  // Agregar clase loaded al body
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);
});






















