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
