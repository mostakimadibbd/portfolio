import { api, ApiError } from './api.js';

/* --------------------------------------------------------------- utilities */

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ theme */

const initTheme = () => {
  const toggle = $('#theme-toggle');
  if (!toggle) return;

  const apply = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    toggle.setAttribute('aria-pressed', String(theme === 'dark'));
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  };

  apply(document.documentElement.getAttribute('data-theme') || 'light');

  toggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    apply(next);
    try {
      localStorage.setItem('ma-theme', next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  });

  window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', (event) => {
      let stored = null;
      try {
        stored = localStorage.getItem('ma-theme');
      } catch {
        /* ignore */
      }
      if (!stored) apply(event.matches ? 'dark' : 'light');
    });
};

/* -------------------------------------------------------------- navigation */

const initNavigation = () => {
  const header = $('#site-header');
  const toggle = $('#nav-toggle');
  const nav = $('#site-nav');
  const progress = $('#scroll-progress');

  const closeMenu = () => {
    if (!nav || !toggle) return;
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open navigation menu');
  };

  toggle?.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
  });

  $$('#site-nav a').forEach((link) => link.addEventListener('click', closeMenu));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  const onScroll = () => {
    const scrolled = window.scrollY > 12;
    header?.classList.toggle('is-scrolled', scrolled);

    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    }
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
};

const initScrollSpy = () => {
  const links = $$('[data-nav-link]');
  if (!links.length) return;

  const sections = links
    .map((link) => document.getElementById(link.getAttribute('href')?.slice(1)))
    .filter(Boolean);

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = entry.target.id;
        links.forEach((link) => {
          const active = link.getAttribute('href') === `#${id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
  );

  sections.forEach((section) => observer.observe(section));
};

/* ---------------------------------------------------------------- reveals */

const initReveals = () => {
  const targets = $$('[data-reveal]');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    targets.forEach((element) => element.classList.add('is-visible'));
    $$('.meter').forEach((meter) => meter.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );

  targets.forEach((target) => observer.observe(target));

  const meterObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        meterObserver.unobserve(entry.target);
      }
    },
    { threshold: 0.3 },
  );

  $$('.meter').forEach((meter) => meterObserver.observe(meter));
};

/* --------------------------------------------------------------- counters */

const initCounters = () => {
  const counters = $$('[data-count-to]');
  if (!counters.length) return;

  const run = (element) => {
    const target = Number(element.dataset.countTo) || 0;
    if (prefersReducedMotion()) {
      element.textContent = String(target);
      return;
    }

    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - elapsed, 3);
      element.textContent = String(Math.round(target * eased));
      if (elapsed < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    counters.forEach(run);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        run(entry.target);
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.5 },
  );

  counters.forEach((counter) => observer.observe(counter));
};

/* ---------------------------------------------------------- role rotator */

const initRoleRotator = () => {
  const rotator = $('#role-rotator');
  if (!rotator) return;

  const roles = [
    'AI & ML Engineer',
    'Full-Stack Developer',
    'MLOps & Platform Engineer',
    'Applied Researcher',
    'Data-Driven Problem Solver',
  ];

  // With reduced motion the server-rendered role stays put.
  if (prefersReducedMotion()) return;

  let index = 0;
  let timer;

  const cycle = () => {
    rotator.classList.add('is-swapping');
    window.setTimeout(() => {
      index = (index + 1) % roles.length;
      rotator.textContent = roles[index];
      rotator.classList.remove('is-swapping');
    }, 320);
  };

  const start = () => {
    timer = window.setInterval(cycle, 3600);
  };

  start();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearInterval(timer);
    } else {
      start();
    }
  });
};

/* --------------------------------------------------------------- projects */

const initProjectFilters = () => {
  const grid = $('#project-grid');
  const filters = $('#project-filters');
  const search = $('#project-search');
  const count = $('#result-count');
  const empty = $('#empty-state');
  if (!grid || !filters) return;

  const cards = $$('.project-card', grid);
  let activeFilter = 'all';
  let query = '';

  const apply = () => {
    const needle = query.trim().toLowerCase();
    let visible = 0;

    for (const card of cards) {
      const tags = (card.dataset.tags ?? '').split(' ');
      const matchesFilter = activeFilter === 'all' || tags.includes(activeFilter);
      const matchesQuery = !needle || card.dataset.title.includes(needle) || card.textContent.toLowerCase().includes(needle);
      const show = matchesFilter && matchesQuery;

      card.hidden = !show;
      if (show) visible += 1;
    }

    if (count) {
      count.textContent =
        visible === cards.length
          ? `Showing all ${cards.length} projects`
          : `Showing ${visible} of ${cards.length} projects`;
    }

    if (empty) empty.hidden = visible !== 0;
  };

  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;

    activeFilter = button.dataset.filter;
    $$('[data-filter]', filters).forEach((chip) => {
      const active = chip === button;
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });

    apply();
  });

  let debounce;
  search?.addEventListener('input', (event) => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => {
      query = event.target.value;
      apply();
    }, 140);
  });

  apply();
};

/* ------------------------------------------------------------------ toast */

const toast = (message, variant = 'info') => {
  const region = $('#toast-region');
  if (!region) return;

  const element = document.createElement('div');
  element.className = `toast is-${variant}`;
  element.setAttribute('role', variant === 'error' ? 'alert' : 'status');
  element.textContent = message;
  region.append(element);

  window.setTimeout(() => {
    element.classList.add('is-leaving');
    element.addEventListener('animationend', () => element.remove(), { once: true });
  }, 5200);
};

/* ----------------------------------------------------------- contact form */

const initContactForm = () => {
  const form = $('#contact-form');
  if (!form) return;

  const submitButton = $('#cf-submit');
  const status = $('#form-status');
  const counter = $('#char-count');
  const messageField = $('#cf-message');

  const showError = (field, message) => {
    const wrapper = field.closest('.field');
    const target = $(`[data-error-for="${field.name}"]`);
    wrapper?.classList.add('has-error');
    if (target) target.textContent = message;
  };

  const clearError = (field) => {
    const wrapper = field.closest('.field');
    const target = $(`[data-error-for="${field.name}"]`);
    wrapper?.classList.remove('has-error');
    if (target) target.textContent = '';
  };

  const validateField = (field) => {
    const value = field.value.trim();
    clearError(field);

    if (field.required && !value) {
      showError(field, `${field.name.charAt(0).toUpperCase()}${field.name.slice(1)} is required.`);
      return false;
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      showError(field, 'Please enter a valid email address.');
      return false;
    }
    if (field.minLength > 0 && value && value.length < field.minLength) {
      showError(field, `Please use at least ${field.minLength} characters.`);
      return false;
    }
    return true;
  };

  const fields = $$('input[name], textarea[name]', form).filter((field) => field.name !== 'company');

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.closest('.field')?.classList.contains('has-error')) validateField(field);
    });
  });

  messageField?.addEventListener('input', (event) => {
    if (counter) counter.textContent = `${event.target.value.length} / 4000`;
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const invalid = fields.filter((field) => !validateField(field));
    if (invalid.length) {
      invalid[0].focus();
      if (status) {
        status.textContent = 'Please correct the highlighted fields.';
        status.className = 'form-status is-error';
      }
      return;
    }

    const payload = Object.fromEntries(
      fields.map((field) => [field.name, field.value.trim()]),
    );

    submitButton?.classList.add('is-loading');
    submitButton?.setAttribute('aria-busy', 'true');
    if (status) {
      status.textContent = 'Sending your message…';
      status.className = 'form-status';
    }

    try {
      const result = await api.post('/api/v1/contact', payload);
      form.reset();
      if (counter) counter.textContent = '0 / 4000';
      if (status) {
        status.textContent = result?.message ?? 'Message sent — thank you.';
        status.className = 'form-status is-success';
      }
      toast(result?.message ?? 'Message sent successfully.', 'success');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
      if (status) {
        status.textContent = message;
        status.className = 'form-status is-error';
      }
      toast(message, 'error');
    } finally {
      submitButton?.classList.remove('is-loading');
      submitButton?.removeAttribute('aria-busy');
    }
  });
};

/* ------------------------------------------------------------- back to top */

const initBackToTop = () => {
  const button = $('#to-top');
  if (!button) return;

  button.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });

  const onScroll = () => {
    button.classList.toggle('is-visible', window.scrollY > 640);
  };

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
};

/* ------------------------------------------------------------------- misc */

const initMisc = () => {
  const year = $('#current-year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Smooth-scroll in-page links with header offset.
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;

      event.preventDefault();
      const offset = 88;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
};

/* ------------------------------------------------------------------ boot */

const boot = () => {
  initTheme();
  initNavigation();
  initScrollSpy();
  initReveals();
  initCounters();
  initRoleRotator();
  initProjectFilters();
  initContactForm();
  initBackToTop();
  initMisc();
  document.documentElement.classList.add('is-ready');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
