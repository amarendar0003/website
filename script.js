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

if (enquiryForm && formStatus) {
  enquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = new FormData(enquiryForm);
    const enquiryText = [
      `Name: ${values.get('name')}`,
      `Organisation: ${values.get('organisation') || 'Not provided'}`,
      `Email: ${values.get('email')}`,
      `Nature of enquiry: ${values.get('enquiry')}`,
      `Message: ${values.get('message')}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(enquiryText);
      formStatus.textContent = 'Enquiry details copied. Nothing was sent.';
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
    if (event.key === 'Escape') closeMenu();
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

  revealItems.forEach((item) => observer.observe(item));
}
