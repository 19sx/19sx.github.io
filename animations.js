const content = {
  de: {
    navProjects: 'Projekte',
    navAchievements: 'Erfolge',
    navContact: 'Kontakt',
    heroRole: 'Software & Cyber Security',
    heroBio: 'Hi, ich bin Alexander (19sx). Ich baue schlanke Software, spiele gerne CTFs und beschäftige mich mit IT-Sicherheit. Am liebsten arbeite ich an CLI-Tools, System-Utilities und schnellen Web-Sachen.',
    projectsTitle: 'Projekte',
    project1Desc: 'Mein persönliches Portfolio. Schlank gehalten mit purem HTML, CSS und modernem JavaScript.',
    project2Desc: 'CS50-Abschlussprojekt: Fokus auf sicheres File-Management, Verschlüsselung und Auth.',
    project3Desc: 'CLI-Tool zum schnellen Prüfen von Telegram-Bot-Tokens und automatisierten API-Healthchecks.',
    viewLive: 'Website öffnen',
    achievementsTitle: 'Erfolge & Zertifikate',
    achievement1Desc: '5. Platz beim Cybersecurity-Wettbewerb der TH Augsburg – praktische Web- & System-Exploits gelöst.',
    achievement1Link: 'Post auf LinkedIn \u2192',
    achievement2Desc: 'Harvards CS50x Informatik-Grundlagenkurs erfolgreich absolviert (C, Python, SQL, Algorithmen).',
    achievement2Link: 'Zertifikat ansehen \u2192',
    contactTitle: 'Kontakt',
    contactDesc: 'Offen für Projekte, CTF-Teams oder einfach zum Austauschen.',
    contactBtn: 'Mail schreiben',
    sourceLink: 'Quellcode auf GitHub'
  },
  en: {
    navProjects: 'Projects',
    navAchievements: 'Achievements',
    navContact: 'Contact',
    heroRole: 'Software & Cyber Security',
    heroBio: "Hey, I'm Alex (19sx). I write code, play CTFs, and build tools. Mostly focused on CLI utilities, system tools, and fast web stuff.",
    projectsTitle: 'Projects',
    project1Desc: 'Personal portfolio website. Kept minimal with vanilla HTML, CSS, and modern JS.',
    project2Desc: 'CS50 final project: secure file storage, encryption, and auth.',
    project3Desc: 'CLI utility to validate Telegram bot tokens and test API endpoints.',
    viewLive: 'Open site',
    achievementsTitle: 'Achievements & Certs',
    achievement1Desc: '5th place at TH Augsburg CTF (exploiting web and system vulnerabilities).',
    achievement1Link: 'LinkedIn post \u2192',
    achievement2Desc: 'Completed Harvard CS50x (C, Python, SQL, data structures, algorithms).',
    achievement2Link: 'View cert \u2192',
    contactTitle: 'Contact',
    contactDesc: 'Open for projects, CTF teams, or just a quick chat.',
    contactBtn: 'Send email',
    sourceLink: 'Source on GitHub'
  }
};

const langBtn = document.getElementById('langToggle');
const themeBtn = document.getElementById('themeToggle');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
const yearEl = document.getElementById('currentYear');

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

function setLanguage(lang) {
  document.documentElement.lang = lang;
  langBtn.textContent = lang === 'de' ? 'EN' : 'DE';
  const dict = content[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

// Language toggle
let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('de') ? 'de' : 'en');
setLanguage(currentLang);

langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'de' ? 'en' : 'de';
  setLanguage(currentLang);
  localStorage.setItem('lang', currentLang);
});

// Theme toggle
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let currentTheme = localStorage.getItem('theme') || (systemDark ? 'dark' : 'light');
setTheme(currentTheme);

themeBtn.addEventListener('click', () => {
  currentTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setTheme(currentTheme);
  localStorage.setItem('theme', currentTheme);
});

// Mobile menu
hamburger.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  hamburger.classList.toggle('active', open);
});

navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('active');
  });
});


