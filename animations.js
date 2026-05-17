// animations.js v4 — Apple bones + hacker interactions + theme/lang toggles

document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  // --- reuse rAF loop for performance (parallax + nav blur) ---
  const nav = document.querySelector('.site-nav');
  const heroH1 = document.querySelector('#hero h1');
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        if (heroH1) {
          heroH1.style.transform = `translateY(${y * -0.25}px)`;
          heroH1.style.opacity = Math.max(0.4, 1 - y / (vh * 0.8));
        }
        const blur = Math.min(20, y / 5);
        if (nav) nav.style.setProperty('--blur-val', `${blur}px`);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // --- IntersectionObserver: fade-up + word-split (guarded) ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      if (el.dataset.animate === 'word-split' && !el.dataset.splitDone) {
        el.dataset.splitDone = '1';
        el.querySelectorAll('.word').forEach((w, i) => {
          w.style.transitionDelay = `${i * 30}ms`;
          w.classList.add('is-visible');
        });
      } else if (el.dataset.animate !== 'word-split') {
        el.classList.add('is-visible');
      }
      observer.unobserve(el);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

  // --- Typewriter effect (skip if prefers-reduced-motion) ---
  const typeEl = document.querySelector('.typewriter');
  if (typeEl) {
    const fullText = typeEl.dataset.text || '';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      typeEl.textContent = fullText;
      typeEl.classList.add('done');
    } else {
      let idx = 0;
      typeEl.textContent = '';
      const interval = setInterval(() => {
        typeEl.textContent += fullText[idx] || '';
        idx++;
        if (idx >= fullText.length) {
          clearInterval(interval);
          typeEl.classList.add('done');
        }
      }, 60);
    }
  }

  // --- Command palette (⌘K) ---
  const palette = document.querySelector('.cmd-k');
  const input = palette?.querySelector('input');
  const resultsList = palette?.querySelector('.cmd-k-results');
  const anchors = ['#hero', '#about', '#projects', '#achievements', '#waitlist', '#contact'];
  let lastFocused = null;
  const cmdItems = resultsList?.querySelectorAll('li');

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      if (palette) {
        palette.hidden = !palette.hidden;
        if (!palette.hidden) {
          lastFocused = document.activeElement;
          input?.focus();
        } else {
          lastFocused?.focus();
        }
      }
    }
    if (e.key === 'Escape' && palette && !palette.hidden) {
      palette.hidden = true;
      lastFocused?.focus();
    }
  });

  if (input && resultsList && cmdItems) {
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase();
      resultsList.innerHTML = '';
      cmdItems.forEach(li => {
        if (!q || li.textContent.toLowerCase().includes(q)) {
          resultsList.appendChild(li.cloneNode(true));
        }
      });
    });
    resultsList.addEventListener('click', (e) => {
      const li = e.target.closest('li');
      if (li) {
        const idx = Array.from(cmdItems).indexOf(li);
        if (idx >= 0 && idx < anchors.length) {
          document.querySelector(anchors[idx])?.scrollIntoView({ behavior: 'smooth' });
        }
        palette.hidden = true;
        lastFocused?.focus();
      }
    });
  }

  // --- Console signature ---
  console.log('%c  _____       _           _   _               _       _   \n |  __ \\     | |         | | (_)             | |     | |  \n | |  | | ___| |__   __ _| |_ _  ___  _ __   | | __ _| |_ \n | |  | |/ _ \\ \\\'_ \\ / _` | __| |/ _ \\| \\\'_ \\  | |/ _` | __|\n | |__| |  __/ | | | (_| | |_| | (_) | | | | | | (_| | |_ \n |_____/ \\___|_| |_|\\__,_|\\__|_|\\___/|_| |_| |_|\\__,_|\\__|\n', 'color: #0071e3; font-family: monospace; font-size: 12px;');
  console.log('%c👋 curious dev — want to chat? alex@19sx.io', 'font-size: 14px; color: #1d1d1f;');

  // --- Konami code easter egg ---
  const konami = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];
  let buffer = [];
  document.addEventListener('keydown', (e) => {
    const activeTag = document.activeElement?.tagName.toLowerCase();
    if (activeTag === 'input' || activeTag === 'textarea') return;

    if (e.key === 'Escape' && document.body.classList.contains('terminal-mode')) {
      document.body.classList.remove('terminal-mode');
      buffer = [];
      return;
    }
    buffer.push(e.key);
    if (buffer.length > konami.length) buffer.shift();
    if (buffer.length === konami.length && buffer.every((k,i) => k === konami[i])) {
      document.body.classList.toggle('terminal-mode');
      buffer = [];
    }
  });

  // --- Smooth scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // --- Mobile hamburger menu ---
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.nav-links');
  let overlay = document.querySelector('.nav-overlay');

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  function closeNav() {
    hamburger?.classList.remove('active');
    mobileNav?.classList.remove('open');
    overlay?.classList.remove('active');
  }

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileNav?.classList.toggle('open');
    overlay?.classList.toggle('active');
  });

  overlay?.addEventListener('click', closeNav);

  mobileNav?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // --- Theme toggle ---
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme') || 'light';
  applyTheme(savedTheme);

  themeToggle?.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('theme', next);
  });

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '\u263E' : '\u2600';
    }
  }

  // --- Language toggle ---
  const langToggle = document.getElementById('langToggle');
  const savedLang = localStorage.getItem('lang') || 'de';
  let currentLang = savedLang;
  applyLanguage(currentLang);

  langToggle?.addEventListener('click', () => {
    currentLang = currentLang === 'de' ? 'en' : 'de';
    applyLanguage(currentLang);
    localStorage.setItem('lang', currentLang);
  });

  // --- Waitlist forms ---
  const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : window.location.origin;

  const tabs = document.querySelectorAll('.waitlist-tab');
  const forms = document.querySelectorAll('.waitlist-form');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      forms.forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(`form-${tab.dataset.tab === 'student' ? 'schueler' : 'kmu'}`);
      if (target) target.classList.add('active');
    });
  });

  const ageSelect = document.getElementById('student-age');
  const parentEmailGroup = document.querySelector('.parent-email-group');
  if (ageSelect && parentEmailGroup) {
    ageSelect.addEventListener('change', () => {
      parentEmailGroup.hidden = ageSelect.value !== 'under_16';
    });
  }

  function showMessage(form, type, text) {
    const msg = form.querySelector('.form-message');
    if (!msg) return;
    msg.className = `form-message ${type}`;
    msg.textContent = text;
  }

  function clearMessage(form) {
    const msg = form.querySelector('.form-message');
    if (msg) { msg.className = 'form-message'; msg.textContent = ''; }
  }

  function setSubmitting(form, isSubmitting) {
    const btn = form.querySelector('.form-submit');
    if (btn) {
      btn.disabled = isSubmitting;
      btn.textContent = isSubmitting
        ? (document.documentElement.lang === 'de' ? 'Wird gesendet...' : 'Sending...')
        : (document.documentElement.lang === 'de' ? 'Auf Warteliste' : 'Join Waitlist');
    }
  }

  const formSchueler = document.getElementById('form-schueler');
  const formKmu = document.getElementById('form-kmu');

  if (formSchueler) {
    formSchueler.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessage(formSchueler);
      setSubmitting(formSchueler, true);

      const fd = new FormData(formSchueler);
      const data = Object.fromEntries(fd.entries());
      data.consent = data.consent === 'on';

      if (data.age_group === 'under_16' && !data.parent_email) {
        showMessage(formSchueler, 'error', 'Bitte gib die E-Mail der Eltern an.');
        setSubmitting(formSchueler, false);
        return;
      }

      try {
        showMessage(formSchueler, 'loading', 'Sende Bestätigungs-E-Mail...');
        const res = await fetch(`${API_BASE}/api/signup/student`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Fehler beim Senden.');
        }
        showMessage(formSchueler, 'success', 'Bitte bestätige deine E-Mail-Adresse. Wir haben dir eine E-Mail geschickt.');
        formSchueler.reset();
        if (parentEmailGroup) parentEmailGroup.hidden = true;
      } catch (err) {
        showMessage(formSchueler, 'error', err.message || 'Ein Fehler ist aufgetreten.');
      } finally {
        setSubmitting(formSchueler, false);
      }
    });
  }

  if (formKmu) {
    formKmu.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearMessage(formKmu);
      setSubmitting(formKmu, true);

      const fd = new FormData(formKmu);
      const data = Object.fromEntries(fd.entries());
      data.consent = data.consent === 'on';

      try {
        showMessage(formKmu, 'loading', 'Sende Bestätigungs-E-Mail...');
        const res = await fetch(`${API_BASE}/api/signup/company`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Fehler beim Senden.');
        }
        showMessage(formKmu, 'success', 'Bitte bestätigen Sie Ihre E-Mail-Adresse. Wir haben Ihnen eine E-Mail geschickt.');
        formKmu.reset();
      } catch (err) {
        showMessage(formKmu, 'error', err.message || 'Ein Fehler ist aufgetreten.');
      } finally {
        setSubmitting(formKmu, false);
      }
    });
  }

  function applyLanguage(lang) {
    document.documentElement.lang = lang === 'de' ? 'de' : 'en';
    if (langToggle) {
      langToggle.textContent = lang === 'de' ? 'EN' : 'DE';
    }
    document.querySelectorAll('[data-en][data-de]').forEach(el => {
      const text = lang === 'de' ? el.dataset.de : el.dataset.en;
      if (!text) return;
      if (el.dataset.animate === 'word-split') {
        const words = text.split(' ');
        el.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(' ');
        const splitWasDone = el.dataset.splitDone;
        delete el.dataset.splitDone;
        if (splitWasDone) {
          el.dataset.splitDone = '1';
          el.querySelectorAll('.word').forEach((w, i) => {
            w.style.transitionDelay = `${i * 30}ms`;
            w.classList.add('is-visible');
          });
        }
      } else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.textContent = text;
      }
    });
  }
});
