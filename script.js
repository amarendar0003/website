const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.main-nav');
const navLinks = document.querySelectorAll('.main-nav a');
const yearNode = document.getElementById('year');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const publicationFilter = document.getElementById('publication-filter');
const publicationList = document.getElementById('publication-list');
const publicationEmpty = document.getElementById('publication-empty');
const enquiryForm = document.getElementById('enquiry-form');
const formStatus = document.getElementById('form-status');

// Add only institutionally verified outputs. Empty by design until content is approved.
const publications = [];

if (yearNode) yearNode.textContent = new Date().getFullYear();

function renderPublications() {
  if (!publicationList || !publicationEmpty || !publicationFilter) return;
  const selectedType = publicationFilter.value;
  const visiblePublications = publications.filter((item) => selectedType === 'all' || item.type === selectedType);
  publicationList.replaceChildren();
  publicationEmpty.hidden = visiblePublications.length > 0;

  visiblePublications.forEach((item) => {
    const article = document.createElement('article');
    article.className = 'publication-item';
    const category = document.createElement('span');
    category.className = 'publication-category';
    category.textContent = item.label;
    const title = document.createElement(item.url ? 'a' : 'h4');
    title.textContent = item.title;
    if (item.url) {
      title.href = item.url;
      title.target = '_blank';
      title.rel = 'noopener noreferrer';
    }
    const detail = document.createElement('p');
    detail.textContent = [item.date, item.description].filter(Boolean).join(' · ');
    article.append(category, title, detail);
    publicationList.append(article);
  });
}

if (publicationFilter) publicationFilter.addEventListener('change', renderPublications);
renderPublications();

function sanitizeFormString(str, maxLen = 1000) {
  if (!str || typeof str !== 'string') return '';
  return str.trim().slice(0, maxLen).replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
}

if (enquiryForm && formStatus) {
  enquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = new FormData(enquiryForm);
    const name = sanitizeFormString(values.get('name'), 150);
    const org = sanitizeFormString(values.get('organisation'), 200) || 'Not provided';
    const email = sanitizeFormString(values.get('email'), 200);
    const enquiry = sanitizeFormString(values.get('enquiry'), 100);
    const message = sanitizeFormString(values.get('message'), 3000);

    const enquiryText = [
      `Name: ${name}`,
      `Organisation: ${org}`,
      `Email: ${email}`,
      `Nature of enquiry: ${enquiry}`,
      `Message: ${message}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(enquiryText);
      formStatus.textContent = 'Enquiry details copied securely. Nothing was sent over the network.';
    } catch {
      formStatus.textContent = 'Copy was unavailable in this browser. Nothing was sent.';
    }
  });
}

function closeMenu() {
  if (!navToggle || !navMenu) return;
  navMenu.classList.remove('is-open');
  navToggle.setAttribute('aria-expanded', 'false');
  navToggle.setAttribute('aria-label', 'Open menu');
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  navLinks.forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
      closeMenu();
      navToggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!navMenu.contains(event.target) && !navToggle.contains(event.target)) closeMenu();
  });
}

const revealItems = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => {
    const siblings = Array.from(item.parentElement.children)
      .filter((sibling) => sibling.classList.contains('reveal'));
    const stagger = Math.min(siblings.indexOf(item), 4) * 65;
    item.style.setProperty('--reveal-delay', `${stagger}ms`);
    item.classList.add('reveal-pending');
    observer.observe(item);
  });
}

const heroCarousel = document.querySelector('.hero-carousel');
if (heroCarousel) {
  const carouselControls = heroCarousel.parentElement.querySelector('.hero-carousel-controls');
  const slides = Array.from(heroCarousel.querySelectorAll('[data-slide]'));
  const dots = carouselControls ? Array.from(carouselControls.querySelectorAll('.carousel-dot')) : [];
  const previousButton = carouselControls && carouselControls.querySelector('.carousel-previous');
  const nextButton = carouselControls && carouselControls.querySelector('.carousel-next');
  const playButton = carouselControls && carouselControls.querySelector('.carousel-play');
  const carouselMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (slides.length && dots.length === slides.length && previousButton && nextButton && playButton) {
    let activeIndex = 0;
    let isPlaying = !carouselMotionPreference.matches;

    function updatePlayButton() {
      playButton.setAttribute('aria-pressed', String(!isPlaying));
      playButton.setAttribute('aria-label', isPlaying ? 'Pause automatic slides' : 'Play automatic slides');
    }

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
        slide.inert = !isActive;
        dots[slideIndex].classList.toggle('is-active', isActive);
        if (isActive) dots[slideIndex].setAttribute('aria-current', 'true');
        else dots[slideIndex].removeAttribute('aria-current');
      });
    }

    function pauseForManualControl(index) {
      isPlaying = false;
      updatePlayButton();
      showSlide(index);
    }

    previousButton.addEventListener('click', () => pauseForManualControl(activeIndex - 1));
    nextButton.addEventListener('click', () => pauseForManualControl(activeIndex + 1));
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => pauseForManualControl(index));
    });
    playButton.addEventListener('click', () => {
      isPlaying = !isPlaying;
      updatePlayButton();
    });
    const updateCarouselMotion = () => {
      if (carouselMotionPreference.matches) {
        isPlaying = false;
        updatePlayButton();
      }
    };
    if (carouselMotionPreference.addEventListener) carouselMotionPreference.addEventListener('change', updateCarouselMotion);
    else carouselMotionPreference.addListener(updateCarouselMotion);

    showSlide(activeIndex);
    updatePlayButton();
    window.setInterval(() => {
      if (!isPlaying || document.hidden || heroCarousel.matches(':hover') || carouselControls.matches(':hover') ||
          heroCarousel.contains(document.activeElement) || carouselControls.contains(document.activeElement)) return;
      showSlide(activeIndex + 1);
    }, 6500);
  }
}

const heroCanvas = document.querySelector('.home-page .hero-network');
if (heroCanvas) {
  const context = heroCanvas.getContext('2d');
  const hero = heroCanvas.closest('.hero');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (context && hero) {
    if (!reducedMotion) hero.classList.add('home-entrance');

    let particles = [];
    let width = 0;
    let height = 0;
    let pixelRatio = 1;
    let animationFrame = 0;
    let lastFrameTime = 0;

    function drawNetwork(delta = 0) {
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      particles.forEach((particle, index) => {
        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;

        for (let otherIndex = index + 1; otherIndex < particles.length; otherIndex += 1) {
          const other = particles[otherIndex];
          const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
          if (distance < 150) {
            context.beginPath();
            context.moveTo(particle.x, particle.y);
            context.lineTo(other.x, other.y);
            context.strokeStyle = `rgba(49, 139, 153, ${(1 - distance / 150) * 0.17})`;
            context.lineWidth = 0.8;
            context.stroke();
          }
        }

        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fillStyle = particle.blue ? 'rgba(91, 159, 179, 0.38)' : 'rgba(22, 143, 137, 0.42)';
        context.fill();
      });
    }

    function resizeNetwork() {
      const bounds = hero.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      heroCanvas.width = Math.round(width * pixelRatio);
      heroCanvas.height = Math.round(height * pixelRatio);

      const mobile = width < 600;
      const count = Math.max(mobile ? 14 : 20, Math.min(mobile ? 26 : 58,
        Math.round((width * height) / (mobile ? 30000 : 21000))));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.12,
        radius: 1 + Math.random() * 0.7,
        blue: Math.random() > 0.55
      }));
      drawNetwork();
    }

    function animateNetwork(timestamp) {
      animationFrame = 0;
      if (document.hidden || motionPreference.matches) return;
      const delta = lastFrameTime ? Math.min(timestamp - lastFrameTime, 40) / 16.67 : 1;
      lastFrameTime = timestamp;
      drawNetwork(delta);
      animationFrame = window.requestAnimationFrame(animateNetwork);
    }

    function startNetwork() {
      if (!document.hidden && !motionPreference.matches && !animationFrame) {
        lastFrameTime = 0;
        animationFrame = window.requestAnimationFrame(animateNetwork);
      }
    }

    function stopNetwork() {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      lastFrameTime = 0;
    }

    function updateMotion() {
      if (motionPreference.matches) {
        stopNetwork();
        hero.classList.remove('home-entrance');
        drawNetwork();
      } else {
        hero.classList.add('home-entrance');
        startNetwork();
      }
    }

    if (document.hidden) hero.classList.add('hero-paused');
    resizeNetwork();
    startNetwork();
    window.addEventListener('resize', resizeNetwork, { passive: true });
    document.addEventListener('visibilitychange', () => {
      hero.classList.toggle('hero-paused', document.hidden);
      if (document.hidden) stopNetwork();
      else startNetwork();
    });
    if (motionPreference.addEventListener) motionPreference.addEventListener('change', updateMotion);
    else motionPreference.addListener(updateMotion);
  }
}

// Persistent Top Notification Bar
(function initNotificationBar() {
  const notificationBar = document.getElementById('siteNotificationBar');
  const dismissBtn = document.getElementById('notificationDismissBtn');
  const reopenBtn = document.getElementById('notificationReopenBtn');
  const STORAGE_KEY = 'cs_dpcru_notification_dismissed';

  if (!notificationBar) return;

  const isDismissed = sessionStorage.getItem(STORAGE_KEY) === 'true';

  if (isDismissed) {
    notificationBar.classList.add('is-hidden');
    if (reopenBtn) reopenBtn.hidden = false;
  } else {
    notificationBar.classList.remove('is-hidden');
    if (reopenBtn) reopenBtn.hidden = true;
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      notificationBar.classList.add('is-hidden');
      sessionStorage.setItem(STORAGE_KEY, 'true');
      if (reopenBtn) {
        reopenBtn.hidden = false;
        reopenBtn.focus();
      }
    });
  }

  if (reopenBtn) {
    reopenBtn.addEventListener('click', () => {
      notificationBar.classList.remove('is-hidden');
      sessionStorage.removeItem(STORAGE_KEY);
      reopenBtn.hidden = true;
      const link = notificationBar.querySelector('.notification-link');
      if (link) link.focus();
    });
  }
})();

// GIGW 3.0 Accessibility Controls: Font Resizer and High Contrast Theme
(function initGIGWControls() {
  const btnFontDec = document.getElementById('btnFontDec');
  const btnFontReset = document.getElementById('btnFontReset');
  const btnFontInc = document.getElementById('btnFontInc');
  const btnThemeDefault = document.getElementById('btnThemeDefault');
  const btnThemeContrast = document.getElementById('btnThemeContrast');

  const FONT_KEY = 'cs_dpcru_font_scale';
  const THEME_KEY = 'cs_dpcru_theme';

  const fontScales = { dec: '90%', reset: '100%', inc: '112%' };

  function applyFontScale(scale) {
    document.documentElement.style.fontSize = scale;
    try { localStorage.setItem(FONT_KEY, scale); } catch {}
  }

  function applyTheme(theme) {
    if (theme === 'high-contrast') {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
      if (btnThemeContrast) btnThemeContrast.classList.add('is-active');
      if (btnThemeDefault) btnThemeDefault.classList.remove('is-active');
    } else {
      document.documentElement.removeAttribute('data-theme');
      if (btnThemeDefault) btnThemeDefault.classList.add('is-active');
      if (btnThemeContrast) btnThemeContrast.classList.remove('is-active');
    }
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
  }

  // Restore saved preferences
  try {
    const savedScale = localStorage.getItem(FONT_KEY);
    if (savedScale) document.documentElement.style.fontSize = savedScale;

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) applyTheme(savedTheme);
  } catch {}

  if (btnFontDec) btnFontDec.addEventListener('click', () => applyFontScale(fontScales.dec));
  if (btnFontReset) btnFontReset.addEventListener('click', () => applyFontScale(fontScales.reset));
  if (btnFontInc) btnFontInc.addEventListener('click', () => applyFontScale(fontScales.inc));

  if (btnThemeDefault) btnThemeDefault.addEventListener('click', () => applyTheme('default'));
  if (btnThemeContrast) btnThemeContrast.addEventListener('click', () => applyTheme('high-contrast'));
})();


