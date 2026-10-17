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

// Load the shared English-Hindi translator on pages that use the institutional header.
(function initLanguageTranslation() {
  const languageContainer = document.querySelector('.gigw-lang');
  if (!languageContainer) return;

  languageContainer.setAttribute('aria-label', 'Language selection: English or Hindi');
  languageContainer.replaceChildren();

  const savedLanguage = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/);
  const selectedLanguage = savedLanguage && decodeURIComponent(savedLanguage[1]).endsWith('/hi')
    ? 'hi'
    : 'en';
  const languageSwitch = document.createElement('div');
  languageSwitch.className = 'language-switch notranslate';
  languageSwitch.setAttribute('role', 'group');
  languageSwitch.setAttribute('aria-label', 'Choose page language');

  const languageOptions = [
    { code: 'en', label: 'English', lang: 'en' },
    { code: 'hi', label: 'हिन्दी', lang: 'hi' }
  ];

  languageOptions.forEach(({ code, label, lang }) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'language-choice';
    button.textContent = label;
    button.lang = lang;
    button.setAttribute('aria-pressed', String(code === selectedLanguage));
    button.addEventListener('click', () => {
      if (code === selectedLanguage) return;

      if (code === 'hi') {
        document.cookie = 'googtrans=/en/hi; path=/; SameSite=Lax';
      } else {
        document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax';
      }

      window.location.reload();
    });
    languageSwitch.append(button);
  });
  languageContainer.append(languageSwitch);

  const widget = document.createElement('div');
  widget.id = 'google_translate_element';
  widget.className = 'translation-widget notranslate';
  widget.setAttribute('aria-hidden', 'true');
  languageContainer.append(widget);

  window.googleTranslateElementInit = () => {
    new window.google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'hi',
      autoDisplay: false
    }, widget.id);
  };

  const translationScript = document.createElement('script');
  translationScript.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  translationScript.async = true;
  document.head.append(translationScript);
})();

const directorProfiles = [
  {
    name: 'Dr. Arjun Mehta',
    designation: 'Director – Cybersecurity Research',
    email: 'arjun.mehta@example.com',
    phone: '+91 90000 00001',
    specialization: 'Cybersecurity, Digital Forensics & Incident Response',
    portrait: 'assets/director-arjun-mehta.svg',
    biography: 'This fictional placeholder profile represents a director focused on strengthening institutional cybersecurity and incident readiness.',
    interests: ['Cybersecurity governance and resilience', 'Digital forensics and evidence integrity', 'Incident response and institutional preparedness']
  },
  {
    name: 'Dr. Priya Sharma',
    designation: 'Director – Data Protection',
    email: 'priya.sharma@example.com',
    phone: '+91 90000 00002',
    specialization: 'Data Privacy, Information Governance & Compliance',
    portrait: 'assets/director-priya-sharma.svg',
    biography: 'This fictional placeholder profile represents a director working at the intersection of privacy, information governance and responsible compliance.',
    interests: ['Data privacy and rights-respecting design', 'Information governance and stewardship', 'Compliance frameworks and accountability']
  },
  {
    name: 'Dr. Rahul Verma',
    designation: 'Director – Data Trust & Policy',
    email: 'rahul.verma@example.com',
    phone: '+91 90000 00003',
    specialization: 'Data Governance, Digital Trust & Public Policy',
    portrait: 'assets/director-rahul-verma.svg',
    biography: 'This fictional placeholder profile represents a director exploring trustworthy data ecosystems and evidence-informed public policy.',
    interests: ['Data governance and institutional responsibility', 'Digital trust and public-sector data use', 'Comparative technology policy']
  },
  {
    name: 'Dr. Ananya Rao',
    designation: 'Director – Research & Innovation',
    email: 'ananya.rao@example.com',
    phone: '+91 90000 00004',
    specialization: 'AI Security, Emerging Technologies & Research',
    portrait: 'assets/director-ananya-rao.svg',
    biography: 'This fictional placeholder profile represents a director supporting interdisciplinary research on emerging technologies and responsible innovation.',
    interests: ['AI security and accountable deployment', 'Emerging technology risk and governance', 'Interdisciplinary research and innovation']
  }
];

const directorGrid = document.getElementById('director-grid');
const directorDialog = document.getElementById('director-dialog');

function createContactIcon(kind) {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(namespace, 'svg');
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');

  const paths = kind === 'email'
    ? ['M4 6h16v12H4z', 'm4 7 8 6 8-6']
    : ['M7 3h3l2 5-2 2a14 14 0 0 0 4 4l2-2 5 2v3c0 1.1-.9 2-2 2C10.8 19 5 13.2 5 6c0-1.7.8-3 2-3Z'];

  paths.forEach((pathData) => {
    const path = document.createElementNS(namespace, 'path');
    path.setAttribute('d', pathData);
    icon.append(path);
  });
  return icon;
}

function createDirectorContactLink(kind, value, label) {
  const link = document.createElement('a');
  link.className = 'director-contact-link';
  link.href = kind === 'email' ? `mailto:${value}` : `tel:${value.replaceAll(' ', '')}`;
  link.append(createContactIcon(kind));
  const text = document.createElement('span');
  text.textContent = label;
  link.append(text);
  return link;
}

function renderDirectorProfiles() {
  if (!directorGrid) return;

  directorProfiles.forEach((director, index) => {
    const card = document.createElement('article');
    card.className = 'director-card reveal';

    const portrait = document.createElement('img');
    portrait.className = 'director-portrait';
    portrait.src = director.portrait;
    portrait.alt = `Illustrated placeholder portrait of ${director.name}`;
    portrait.width = 480;
    portrait.height = 560;
    card.append(portrait);

    const content = document.createElement('div');
    content.className = 'director-card-content';
    const placeholder = document.createElement('span');
    placeholder.className = 'director-placeholder';
    placeholder.textContent = 'Fictional placeholder';
    content.append(placeholder);

    const name = document.createElement('h3');
    name.textContent = director.name;
    content.append(name);

    const designation = document.createElement('p');
    designation.className = 'director-designation';
    designation.textContent = director.designation;
    content.append(designation);

    const expertise = document.createElement('p');
    expertise.className = 'director-expertise';
    const expertiseLabel = document.createElement('strong');
    expertiseLabel.textContent = 'Specialization';
    expertise.append(expertiseLabel, document.createElement('br'), document.createTextNode(director.specialization));
    content.append(expertise);

    const contacts = document.createElement('div');
    contacts.className = 'director-card-contacts';
    contacts.append(
      createDirectorContactLink('email', director.email, director.email),
      createDirectorContactLink('phone', director.phone, director.phone)
    );
    content.append(contacts);

    const profileButton = document.createElement('button');
    profileButton.className = 'director-profile-button';
    profileButton.type = 'button';
    profileButton.dataset.directorIndex = String(index);
    profileButton.textContent = 'View Profile';
    content.append(profileButton);
    card.append(content);
    directorGrid.append(card);
  });
}

function openDirectorProfile(director) {
  if (!directorDialog) return;

  directorDialog.querySelector('#director-dialog-portrait').src = director.portrait;
  directorDialog.querySelector('#director-dialog-portrait').alt = `Illustrated placeholder portrait of ${director.name}`;
  directorDialog.querySelector('#director-dialog-name').textContent = director.name;
  directorDialog.querySelector('#director-dialog-designation').textContent = director.designation;
  directorDialog.querySelector('#director-dialog-bio').textContent = director.biography;

  const interests = directorDialog.querySelector('#director-dialog-interests');
  interests.replaceChildren();
  director.interests.forEach((interest) => {
    const item = document.createElement('li');
    item.textContent = interest;
    interests.append(item);
  });

  const contacts = directorDialog.querySelector('#director-dialog-contact');
  contacts.replaceChildren(
    createDirectorContactLink('email', director.email, director.email),
    createDirectorContactLink('phone', director.phone, director.phone)
  );
  directorDialog.showModal();
}

renderDirectorProfiles();

if (directorGrid && directorDialog) {
  directorGrid.addEventListener('click', (event) => {
    const button = event.target.closest('[data-director-index]');
    if (!button) return;

    const director = directorProfiles[Number(button.dataset.directorIndex)];
    if (director) openDirectorProfile(director);
  });

  directorDialog.querySelector('.director-dialog-close').addEventListener('click', () => {
    directorDialog.close();
  });

  directorDialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    directorDialog.close();
  });

  directorDialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') directorDialog.close();
  });

  directorDialog.addEventListener('click', (event) => {
    if (event.target === directorDialog) directorDialog.close();
  });
}

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
  let toastTimer;
  enquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!enquiryForm.reportValidity()) return;

    const submitButton = enquiryForm.querySelector('[type="submit"]');
    const values = new FormData(enquiryForm);
    const payload = {
      name: sanitizeFormString(values.get('name'), 150),
      organisation: sanitizeFormString(values.get('organisation'), 200),
      email: sanitizeFormString(values.get('email'), 200),
      mobile: sanitizeFormString(values.get('mobile'), 30),
      enquiry: sanitizeFormString(values.get('enquiry'), 100),
      message: sanitizeFormString(values.get('message'), 3000)
    };

    submitButton.disabled = true;
    window.clearTimeout(toastTimer);
    formStatus.classList.remove('is-success', 'is-error');
    formStatus.classList.add('is-visible');
    formStatus.textContent = 'Sending…';

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Unable to send your enquiry. Please try again.');

      formStatus.textContent = 'Your enquiry was sent successfully.';
      formStatus.classList.add('is-success');
      enquiryForm.reset();
    } catch (error) {
      formStatus.textContent = error.message || 'Unable to send your enquiry. Please try again.';
      formStatus.classList.add('is-error');
    } finally {
      submitButton.disabled = false;
      toastTimer = window.setTimeout(() => formStatus.classList.remove('is-visible'), 5000);
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

function debounce(callback, wait) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => callback(...args), wait);
  };
}

function setFormStatus(element, message, type) {
  if (!element) return;
  element.textContent = message;
  element.classList.remove('is-success', 'is-error');
  if (type) element.classList.add(type);
  element.classList.add('is-visible');
}

function getApiJson(url, options = {}) {
  const requestOptions = {
    headers: { Accept: 'application/json', ...(options.headers || {}) },
    ...options,
  };
  if (options.body && !requestOptions.headers['Content-Type']) {
    requestOptions.headers['Content-Type'] = 'application/json';
  }
  return fetch(url, requestOptions).then(async (response) => {
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.error || 'Request failed.');
    }
    return result;
  });
}

function initResearchPage() {
  const searchInput = document.getElementById('publication-search');
  const categorySelect = document.getElementById('publication-category');
  const yearSelect = document.getElementById('publication-year');
  const typeSelect = document.getElementById('publication-type');
  const authorSelect = document.getElementById('publication-author');
  const sortSelect = document.getElementById('publication-sort');
  const clearButton = document.getElementById('clear-filters');
  const resultsCount = document.getElementById('results-count');
  const publicationList = document.getElementById('publication-list');
  const publicationEmpty = document.getElementById('publication-empty');
  const pageContainer = document.getElementById('publication-pagination');
  const totalPublications = document.getElementById('total-publications');

  if (!searchInput && !categorySelect && !yearSelect && !typeSelect && !authorSelect && !sortSelect) return;

  const state = {
    page: 1,
    search: '',
    category: 'all',
    year: 'all',
    documentType: 'all',
    author: 'all',
    sort: 'newest'
  };

  function updateOptions(select, values, placeholder) {
    if (!select) return;
    const currentValue = select.value;
    select.replaceChildren();
    const defaultOption = document.createElement('option');
    defaultOption.value = 'all';
    defaultOption.textContent = placeholder;
    select.append(defaultOption);
    values.forEach((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.append(option);
    });
    if (values.includes(currentValue)) {
      select.value = currentValue;
    } else {
      select.value = 'all';
    }
  }

  function renderPublicationCards(items) {
    if (!publicationList) return;
    publicationList.replaceChildren();

    if (!items.length) {
      if (publicationEmpty) publicationEmpty.hidden = false;
      if (resultsCount) resultsCount.textContent = '0 matching publications';
      return;
    }

    if (publicationEmpty) publicationEmpty.hidden = true;
    items.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'publication-card reveal';

      const meta = document.createElement('div');
      meta.className = 'publication-card-meta';
      const category = document.createElement('span');
      category.className = 'publication-tag';
      category.textContent = item.category || 'Research';
      meta.append(category);

      const title = document.createElement('h3');
      title.textContent = item.title;

      const description = document.createElement('p');
      description.className = 'publication-description';
      description.textContent = item.description || item.abstract || 'No description available.';

      const details = document.createElement('ul');
      details.className = 'publication-details';
      const detailsList = [
        ['Authors', item.authors || 'Not specified'],
        ['Type', item.document_type || 'Other'],
        ['Year', item.publication_year || 'N/A'],
        ['Date', item.publication_date ? new Date(item.publication_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'],
        ['Format', item.document_format || 'PDF'],
        ['File size', item.file_size || 'Not specified']
      ];
      detailsList.forEach(([label, value]) => {
        const li = document.createElement('li');
        const labelEl = document.createElement('strong');
        labelEl.textContent = `${label}: `;
        li.append(labelEl, document.createTextNode(String(value)));
        details.append(li);
      });

      const actions = document.createElement('div');
      actions.className = 'publication-card-actions';

      const readLink = document.createElement('a');
      readLink.href = `publication-view.html?id=${item.id}`;
      readLink.className = 'btn-primary';
      readLink.textContent = 'Read Document';

      const downloadLink = document.createElement('a');
      downloadLink.href = item.pdf_url || item.file_url || '#';
      downloadLink.className = 'btn-secondary';
      downloadLink.textContent = item.pdf_url || item.file_url ? 'Download PDF' : 'View file';
      downloadLink.target = '_blank';
      downloadLink.rel = 'noopener noreferrer';
      if (!item.pdf_url && !item.file_url) {
        downloadLink.setAttribute('aria-disabled', 'true');
        downloadLink.style.pointerEvents = 'none';
        downloadLink.style.opacity = '0.55';
      }

      actions.append(readLink, downloadLink);
      card.append(meta, title, description, details, actions);
      publicationList.append(card);
    });
  }

  function renderPagination(totalPages, currentPage) {
    if (!pageContainer) return;
    pageContainer.replaceChildren();
    if (totalPages <= 1) return;

    const prevButton = document.createElement('button');
    prevButton.type = 'button';
    prevButton.textContent = 'Previous';
    prevButton.disabled = currentPage <= 1;
    prevButton.addEventListener('click', () => {
      if (currentPage > 1) {
        state.page = currentPage - 1;
        loadPublications();
      }
    });
    pageContainer.append(prevButton);

    const pageDisplay = document.createElement('span');
    pageDisplay.className = 'pagination-current';
    pageDisplay.textContent = `Page ${currentPage} of ${totalPages}`;
    pageContainer.append(pageDisplay);

    const nextButton = document.createElement('button');
    nextButton.type = 'button';
    nextButton.textContent = 'Next';
    nextButton.disabled = currentPage >= totalPages;
    nextButton.addEventListener('click', () => {
      if (currentPage < totalPages) {
        state.page = currentPage + 1;
        loadPublications();
      }
    });
    pageContainer.append(nextButton);
  }

  async function loadPublications() {
    const params = new URLSearchParams({
      search: state.search,
      category: state.category,
      year: state.year,
      document_type: state.documentType,
      author: state.author,
      sort: state.sort,
      page: String(state.page),
      limit: '9'
    });

    try {
      const data = await getApiJson(`/api/publications?${params.toString()}`);
      const items = Array.isArray(data.publications) ? data.publications : [];
      if (totalPublications) totalPublications.textContent = String(data.total || 0);
      if (resultsCount) resultsCount.textContent = `${data.total || 0} matching publication${(data.total || 0) === 1 ? '' : 's'}`;
      renderPublicationCards(items);
      renderPagination(data.pages || 1, data.page || 1);

      if (Array.isArray(data.categories)) {
        updateOptions(categorySelect, data.categories, 'All categories');
      }
      if (Array.isArray(data.years)) {
        updateOptions(yearSelect, data.years.map(String), 'All years');
      }
      if (Array.isArray(data.authors)) {
        updateOptions(authorSelect, data.authors, 'All authors');
      }
    } catch (error) {
      if (publicationEmpty) publicationEmpty.hidden = false;
      if (resultsCount) resultsCount.textContent = 'Unable to load publications';
      if (publicationList) publicationList.replaceChildren();
    }
  }

  const handleFilterChange = () => {
    state.search = searchInput ? searchInput.value.trim() : '';
    state.category = categorySelect ? categorySelect.value : 'all';
    state.year = yearSelect ? yearSelect.value : 'all';
    state.documentType = typeSelect ? typeSelect.value : 'all';
    state.author = authorSelect ? authorSelect.value : 'all';
    state.sort = sortSelect ? sortSelect.value : 'newest';
    state.page = 1;
    loadPublications();
  };

  if (searchInput) {
    searchInput.addEventListener('input', debounce(handleFilterChange, 250));
  }
  if (categorySelect) categorySelect.addEventListener('change', handleFilterChange);
  if (yearSelect) yearSelect.addEventListener('change', handleFilterChange);
  if (typeSelect) typeSelect.addEventListener('change', handleFilterChange);
  if (authorSelect) authorSelect.addEventListener('change', handleFilterChange);
  if (sortSelect) sortSelect.addEventListener('change', handleFilterChange);
  if (clearButton) {
    clearButton.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (categorySelect) categorySelect.value = 'all';
      if (yearSelect) yearSelect.value = 'all';
      if (typeSelect) typeSelect.value = 'all';
      if (authorSelect) authorSelect.value = 'all';
      if (sortSelect) sortSelect.value = 'newest';
      state.search = '';
      state.category = 'all';
      state.year = 'all';
      state.documentType = 'all';
      state.author = 'all';
      state.sort = 'newest';
      state.page = 1;
      loadPublications();
    });
  }

  loadPublications();
}

function initPublicationViewer() {
  const contentRoot = document.getElementById('reader-content');
  if (!contentRoot) return;

  const errorNode = document.getElementById('reader-error');
  const loadingNode = document.getElementById('reader-loading');
  const titleNode = document.getElementById('reader-title');
  const categoryNode = document.getElementById('reader-category');
  const authorsNode = document.getElementById('reader-authors');
  const dateNode = document.getElementById('reader-date');
  const descriptionNode = document.getElementById('reader-description');
  const abstractNode = document.getElementById('reader-abstract');
  const typeNode = document.getElementById('reader-type');
  const keywordsNode = document.getElementById('reader-keywords');
  const bodyNode = document.getElementById('reader-body');
  const pdfPanel = document.getElementById('reader-pdf-panel');
  const pdfFrame = document.getElementById('reader-pdf');
  const downloadLink = document.getElementById('reader-download');

  const params = new URLSearchParams(window.location.search);
  const publicationId = params.get('id') || Number((window.location.pathname.split('/').filter(Boolean).pop() || '0'));

  if (!publicationId) {
    if (loadingNode) loadingNode.hidden = true;
    if (errorNode) {
      errorNode.hidden = false;
      errorNode.textContent = 'No publication was selected to read.';
    }
    return;
  }

  getApiJson(`/api/publications/${publicationId}`)
    .then((publication) => {
      if (!publication) return;
      if (titleNode) titleNode.textContent = publication.title || 'Untitled publication';
      if (categoryNode) categoryNode.textContent = publication.category || 'Research';
      if (authorsNode) authorsNode.textContent = publication.authors || 'Authors not specified';
      if (dateNode) dateNode.textContent = publication.publication_date ? new Date(publication.publication_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not specified';
      if (descriptionNode) descriptionNode.textContent = publication.description || publication.abstract || 'No description available.';
      if (abstractNode) abstractNode.textContent = publication.abstract || 'No abstract has been supplied.';
      if (typeNode) typeNode.textContent = publication.document_type || 'Other';
      if (keywordsNode) keywordsNode.textContent = Array.isArray(publication.keywords) && publication.keywords.length ? publication.keywords.join(', ') : 'No keywords available';
      if (bodyNode) {
        const contentText = publication.content || publication.abstract || publication.description || '';
        if (contentText) {
          const paragraphs = contentText.split(/\n+/).map((segment) => segment.trim()).filter(Boolean);
          bodyNode.replaceChildren();
          paragraphs.forEach((paragraph) => {
            const paragraphNode = document.createElement('p');
            paragraphNode.textContent = paragraph;
            bodyNode.append(paragraphNode);
          });
        } else {
          bodyNode.innerHTML = '<p>Only a downloadable document is available for this publication. Use the download option below.</p>';
        }
      }
      if (pdfPanel && (publication.pdf_url || publication.file_url)) {
        const pdfSource = publication.pdf_url || publication.file_url;
        pdfPanel.hidden = false;
        if (pdfFrame) pdfFrame.src = pdfSource;
        if (downloadLink) {
          downloadLink.href = pdfSource;
          downloadLink.textContent = publication.pdf_url ? 'Download PDF' : 'Download file';
        }
      }
      if (loadingNode) loadingNode.hidden = true;
      if (contentRoot) contentRoot.hidden = false;
    })
    .catch((error) => {
      if (loadingNode) loadingNode.hidden = true;
      if (errorNode) {
        errorNode.hidden = false;
        errorNode.textContent = error.message || 'This publication could not be loaded.';
      }
    });
}

function initAdminAuth() {
  const usernameDisplay = document.getElementById('admin-username-display');
  const logoutButtons = document.querySelectorAll('#admin-logout');
  const loginForm = document.getElementById('admin-login-form');
  const loginStatus = document.getElementById('admin-login-status');

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!loginForm.reportValidity()) return;
      const formData = new FormData(loginForm);
      const payload = {
        username: String(formData.get('username') || '').trim(),
        password: String(formData.get('password') || '')
      };
      try {
        const result = await getApiJson('/api/admin/login', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        setFormStatus(loginStatus, result.message || 'Signed in successfully.', 'is-success');
        window.setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 500);
      } catch (error) {
        setFormStatus(loginStatus, error.message || 'Unable to sign in.', 'is-error');
      }
    });
  }

  if (logoutButtons.length) {
    logoutButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        try {
          await getApiJson('/api/admin/logout', { method: 'POST' });
        } catch (error) {
          // ignore logout failure and continue to the login page
        }
        window.location.href = 'login.html';
      });
    });
  }

  if (usernameDisplay) {
    getApiJson('/api/admin/me')
      .then((result) => {
        usernameDisplay.textContent = result.username || 'Admin';
      })
      .catch(() => {
        window.location.href = 'login.html';
      });
  }
}

async function initAdminDashboard() {
  const isDashboard = document.body && window.location.pathname.endsWith('/dashboard.html');
  const isPublicationsPage = document.body && window.location.pathname.endsWith('/publications.html');
  const isEditorPage = document.body && window.location.pathname.endsWith('/publication-editor.html');
  if (!isDashboard && !isPublicationsPage && !isEditorPage) return;

  try {
    await getApiJson('/api/admin/me');
  } catch (error) {
    window.location.href = 'login.html';
    return;
  }

  if (isDashboard) {
    const stats = [
      ['stat-total', 'total_publications'],
      ['stat-published', 'published_publications'],
      ['stat-draft', 'draft_publications'],
      ['stat-archived', 'archived_publications'],
      ['stat-categories', 'total_categories']
    ];
    const summary = await getApiJson('/api/admin/summary');
    stats.forEach(([id, key]) => {
      const node = document.getElementById(id);
      if (node) node.textContent = String(summary.totals?.[key] ?? 0);
    });

    const recentPublications = document.getElementById('recent-publications');
    const recentActivity = document.getElementById('recent-activity');
    if (recentPublications) {
      const publications = summary.recent_publications || [];
      recentPublications.replaceChildren();
      if (!publications.length) {
        recentPublications.innerHTML = '<p class="empty-state">No recent publications yet.</p>';
      } else {
        publications.forEach((item) => {
          const row = document.createElement('div');
          row.className = 'list-row';
          const link = document.createElement('a');
          link.href = `publication-editor.html?id=${item.id}`;
          link.textContent = item.title;
          const meta = document.createElement('span');
          meta.textContent = `${item.category || 'Research'} · ${item.publication_date || 'Date unavailable'}`;
          row.append(link, meta);
          recentPublications.append(row);
        });
      }
    }

    if (recentActivity) {
      const activity = summary.recent_activity || [];
      recentActivity.replaceChildren();
      if (!activity.length) {
        recentActivity.innerHTML = '<p class="empty-state">No recent activity.</p>';
      } else {
        activity.forEach((event) => {
          const row = document.createElement('div');
          row.className = 'list-row';
          const label = document.createElement('strong');
          label.textContent = event.action.replace(/_/g, ' ');
          const meta = document.createElement('span');
          meta.textContent = `${event.actor || 'System'} · ${event.created_at || 'recently'}`;
          row.append(label, meta);
          recentActivity.append(row);
        });
      }
    }
  }

  if (isPublicationsPage) {
    const tableBody = document.getElementById('admin-publication-table-body');
    const searchInput = document.getElementById('admin-publication-search');
    const loadPublications = async () => {
      const data = await getApiJson('/api/admin/publications');
      const items = data.publications || [];
      const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      const filtered = !query ? items : items.filter((item) => {
        const haystack = `${item.title} ${item.category} ${item.document_type} ${item.authors}`.toLowerCase();
        return haystack.includes(query);
      });

      if (!tableBody) return;
      tableBody.replaceChildren();
      filtered.forEach((item) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><a href="publication-editor.html?id=${item.id}">${item.title}</a></td>
          <td>${item.category || 'Research'}</td>
          <td>${item.document_type || 'Other'}</td>
          <td>${item.publication_year || '—'}</td>
          <td>${item.is_archived ? 'Archived' : item.is_published ? 'Published' : 'Draft'}</td>
          <td><a href="publication-editor.html?id=${item.id}" class="btn-link">Edit</a></td>
        `;
        tableBody.append(row);
      });
    };

    if (searchInput) {
      searchInput.addEventListener('input', debounce(loadPublications, 200));
    }
    loadPublications();
  }

  if (isEditorPage) {
    const form = document.getElementById('publication-editor-form');
    const statusNode = document.getElementById('admin-editor-status');
    const deleteButton = document.getElementById('delete-publication');
    const params = new URLSearchParams(window.location.search);
    const publicationId = params.get('id');

    if (publicationId) {
      const publication = await getApiJson(`/api/admin/publications/${publicationId}`);
      const formFields = {
        title: document.getElementById('publication-title'),
        authors: document.getElementById('publication-authors'),
        category: document.getElementById('publication-category-admin'),
        document_type: document.getElementById('publication-type-admin'),
        publication_year: document.getElementById('publication-year-admin'),
        publication_date: document.getElementById('publication-date-admin'),
        document_format: document.getElementById('publication-format-admin'),
        file_size: document.getElementById('publication-file-size'),
        status: document.getElementById('publication-status-admin'),
        description: document.getElementById('publication-description'),
        abstract: document.getElementById('publication-abstract'),
        content: document.getElementById('publication-content'),
        keywords: document.getElementById('publication-keywords'),
        pdf_url: document.getElementById('publication-pdf-url'),
        file_url: document.getElementById('publication-file-url')
      };
      Object.entries(formFields).forEach(([key, element]) => {
        if (!element) return;
        const value = publication[key];
        if (value === undefined || value === null) return;
        if (key === 'status') {
          element.value = publication.is_archived ? 'archived' : publication.is_published ? 'published' : 'draft';
        } else if (key === 'keywords') {
          element.value = Array.isArray(value) ? value.join(', ') : String(value || '');
        } else if (key === 'document_type') {
          element.value = value;
        } else {
          element.value = value;
        }
      });
      const editorTitle = document.getElementById('publication-editor-title');
      if (editorTitle) editorTitle.textContent = 'Edit publication';
      if (deleteButton) deleteButton.hidden = false;

      if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
          if (!window.confirm('Delete this publication?')) return;
          try {
            await getApiJson(`/api/admin/publications/${publicationId}`, { method: 'DELETE' });
            window.location.href = 'publications.html';
          } catch (error) {
            setFormStatus(statusNode, error.message || 'Unable to delete publication.', 'is-error');
          }
        });
      }
    }

    if (form) {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const payload = {
          title: document.getElementById('publication-title').value.trim(),
          authors: document.getElementById('publication-authors').value.trim(),
          category: document.getElementById('publication-category-admin').value,
          document_type: document.getElementById('publication-type-admin').value,
          publication_year: Number(document.getElementById('publication-year-admin').value || 0) || null,
          publication_date: document.getElementById('publication-date-admin').value || null,
          document_format: document.getElementById('publication-format-admin').value,
          file_size: document.getElementById('publication-file-size').value.trim() || null,
          status: document.getElementById('publication-status-admin').value,
          description: document.getElementById('publication-description').value.trim(),
          abstract: document.getElementById('publication-abstract').value.trim(),
          content: document.getElementById('publication-content').value.trim(),
          keywords: document.getElementById('publication-keywords').value.trim(),
          pdf_url: document.getElementById('publication-pdf-url').value.trim() || null,
          file_url: document.getElementById('publication-file-url').value.trim() || null,
        };

        try {
          if (publicationId) {
            await getApiJson(`/api/admin/publications/${publicationId}`, { method: 'PUT', body: JSON.stringify(payload) });
            setFormStatus(statusNode, 'Publication updated successfully.', 'is-success');
          } else {
            const result = await getApiJson('/api/admin/publications', { method: 'POST', body: JSON.stringify(payload) });
            setFormStatus(statusNode, result.message || 'Publication saved successfully.', 'is-success');
            const newId = result.id;
            if (newId) {
              window.setTimeout(() => {
                window.location.href = `publication-editor.html?id=${newId}`;
              }, 500);
            }
          }
        } catch (error) {
          setFormStatus(statusNode, error.message || 'Unable to save publication.', 'is-error');
        }
      });
    }
  }
}

if (document.getElementById('publication-search') || document.getElementById('publication-category') || document.getElementById('publication-year') || document.getElementById('publication-type') || document.getElementById('publication-author') || document.getElementById('publication-sort')) {
  initResearchPage();
}

if (document.getElementById('reader-content') || document.getElementById('reader-loading')) {
  initPublicationViewer();
}

if (document.getElementById('admin-login-form') || document.getElementById('admin-logout') || document.getElementById('admin-username-display') || (document.body && (window.location.pathname.includes('/admin/') || window.location.pathname.endsWith('/admin')))) {
  initAdminAuth();
  initAdminDashboard();
}
