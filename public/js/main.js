import { api, ApiError } from './api.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const storageKey = 'ma-portfolio-theme-v1';
const defaults = { mode: 'system', accent: '#b45335', radius: 'soft', font: 'sans', motion: 'full' };
const allowed = {
  mode: ['system', 'light', 'dark'],
  radius: ['sharp', 'soft', 'round'],
  font: ['sans', 'mono'],
  motion: ['full', 'reduced'],
};

const readStoredTheme = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return stored && typeof stored === 'object' ? stored : {};
  } catch {
    return {};
  }
};

const isHexColor = (value) => /^#[\da-f]{6}$/i.test(value);

const colorChannels = (hex) => {
  const value = hex.slice(1);
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16) / 255);
};

const luminance = (hex) =>
  colorChannels(hex)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
    .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);

const contrastRatio = (first, second) => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};

const toHex = (value) =>
  `#${Math.round(value)
    .toString(16)
    .padStart(2, '0')}`;

const accessibleAccent = (color, mode) => {
  const background = mode === 'dark' ? '#111613' : '#fbfaf7';
  if (contrastRatio(color, background) >= 4.5) return color;

  const channels = colorChannels(color).map((channel) => channel * 255);
  for (let step = 1; step <= 100; step += 1) {
    const ratio = step / 100;
    const candidate = channels.map((channel) =>
      mode === 'dark' ? channel + (255 - channel) * ratio : channel * (1 - ratio),
    );
    const hex = `#${candidate.map(toHex).join('').replace(/#/g, '')}`;
    if (contrastRatio(hex, background) >= 4.5) return hex;
  }
  return mode === 'dark' ? '#ffffff' : '#000000';
};

const applyTheme = (theme) => {
  const root = document.documentElement;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const mode = theme.mode === 'system' ? (systemDark ? 'dark' : 'light') : theme.mode;
  root.dataset.theme = mode;
  root.dataset.radius = theme.radius;
  root.dataset.font = theme.font;
  root.dataset.motion = theme.motion;

  const accent = accessibleAccent(theme.accent, mode);
  root.style.setProperty('--accent-custom', accent);
  root.style.setProperty(
    '--accent-custom-contrast',
    contrastRatio(accent, '#111613') > contrastRatio(accent, '#ffffff') ? '#111613' : '#ffffff',
  );
  $('#theme-color')?.setAttribute('content', mode === 'dark' ? '#111613' : '#fbfaf7');
};

const parseThemeQuery = () => {
  const params = new URLSearchParams(location.search);
  if (!params.has('accent') && !params.has('mode') && !params.has('radius')) return null;
  const theme = { ...defaults };
  for (const key of Object.keys(allowed)) {
    const value = params.get(key);
    if (value && allowed[key].includes(value)) theme[key] = value;
  }
  const accent = params.get('accent');
  if (accent && isHexColor(accent)) theme.accent = accent;
  return theme;
};

const initTheme = () => {
  let theme = { ...defaults, ...readStoredTheme() };
  const sharedTheme = parseThemeQuery();
  if (sharedTheme) theme = sharedTheme;
  if (!isHexColor(theme.accent)) theme.accent = defaults.accent;
  for (const key of Object.keys(allowed)) {
    if (!allowed[key].includes(theme[key])) theme[key] = defaults[key];
  }
  applyTheme(theme);

  const panel = $('#theme-panel');
  const openButton = $('#customise-open');
  const closeButton = $('#customise-close');
  const status = $('#theme-status');
  const setStatus = (message) => {
    if (status) status.textContent = message;
  };
  const save = () => {
    applyTheme(theme);
    try {
      localStorage.setItem(storageKey, JSON.stringify(theme));
      setStatus('Theme saved on this device.');
    } catch {
      setStatus('Theme applied for this visit; browser storage is unavailable.');
    }
  };
  const setRadio = (name, value) => {
    const input = $(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  };
  const syncControls = () => {
    $('#theme-mode').value = theme.mode;
    $('#accent-custom').value = theme.accent;
    setRadio('radius', theme.radius);
    setRadio('font', theme.font);
    setRadio('motion', theme.motion);
    $$('[data-accent]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.accent.toLowerCase() === theme.accent.toLowerCase()));
    });
  };
  syncControls();

  const closePanel = () => {
    if (!panel) return;
    panel.hidden = true;
    openButton?.focus();
  };
  openButton?.addEventListener('click', () => {
    if (!panel) return;
    panel.hidden = false;
    $('#theme-mode')?.focus();
  });
  closeButton?.addEventListener('click', closePanel);
  panel?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closePanel();
    if (event.key !== 'Tab') return;
    const controls = $$('button, input, select', panel).filter((control) => !control.disabled);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });

  $('#theme-mode')?.addEventListener('change', (event) => {
    theme.mode = event.target.value;
    save();
  });
  $('#accent-custom')?.addEventListener('input', (event) => {
    theme.accent = event.target.value;
    syncControls();
    save();
  });
  $('#accent-presets')?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-accent]');
    if (!button) return;
    theme.accent = button.dataset.accent;
    syncControls();
    save();
  });
  for (const name of ['radius', 'font', 'motion']) {
    $$(`input[name="${name}"]`).forEach((input) =>
      input.addEventListener('change', () => {
        theme[name] = input.value;
        save();
      }),
    );
  }
  $('#theme-reset')?.addEventListener('click', () => {
    theme = { ...defaults };
    syncControls();
    save();
  });
  $('#theme-share')?.addEventListener('click', async () => {
    const url = new URL(location.href);
    for (const key of [...allowed.mode, ...allowed.radius, ...allowed.font, ...allowed.motion]) {
      url.searchParams.delete(key);
    }
    url.searchParams.set('mode', theme.mode);
    url.searchParams.set('accent', theme.accent);
    url.searchParams.set('radius', theme.radius);
    url.searchParams.set('font', theme.font);
    url.searchParams.set('motion', theme.motion);
    try {
      await navigator.clipboard.writeText(url.href);
      setStatus('Theme link copied.');
    } catch {
      setStatus(url.href);
    }
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (theme.mode === 'system') applyTheme(theme);
  });

  return { closePanel };
};

const initNavigation = () => {
  const toggle = $('#nav-toggle');
  const nav = $('#site-nav');
  const close = () => {
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
  $$('#site-nav a').forEach((link) => link.addEventListener('click', close));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
};

const initProjectFilters = () => {
  const grid = $('#project-grid');
  const filters = $('#project-filters');
  if (!grid || !filters) return;
  const cards = $$('.project-card', grid);
  const search = $('#project-search');
  const count = $('#result-count');
  const empty = $('#empty-state');
  let activeFilter = 'all';
  let query = '';
  const apply = () => {
    const needle = query.trim().toLowerCase();
    let visible = 0;
    for (const card of cards) {
      const tags = (card.dataset.tags ?? '').split(' ');
      const matchesFilter = activeFilter === 'all' || tags.includes(activeFilter);
      const matchesQuery = !needle || card.textContent.toLowerCase().includes(needle);
      card.hidden = !(matchesFilter && matchesQuery);
      if (!card.hidden) visible += 1;
    }
    if (count) count.textContent = `Showing ${visible} of ${cards.length} projects`;
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
  search?.addEventListener('input', () => {
    query = search.value;
    apply();
  });
  apply();
};

const initContactForm = () => {
  const form = $('#contact-form');
  if (!form) return;
  const submitButton = $('#cf-submit');
  const status = $('#form-status');
  const fields = $$('input[name], textarea[name]', form).filter((field) => field.name !== 'company');
  const showError = (field, message) => {
    field.closest('.field')?.classList.add('has-error');
    const target = $(`[data-error-for="${field.name}"]`);
    if (target) target.textContent = message;
  };
  const validate = (field) => {
    field.closest('.field')?.classList.remove('has-error');
    const target = $(`[data-error-for="${field.name}"]`);
    if (target) target.textContent = '';
    const value = field.value.trim();
    if (field.required && !value) {
      showError(field, `${field.labels?.[0]?.textContent || 'This field'} is required.`);
      return false;
    }
    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      showError(field, 'Please enter a valid email address.');
      return false;
    }
    if (field.minLength > 0 && value.length < field.minLength) {
      showError(field, `Please use at least ${field.minLength} characters.`);
      return false;
    }
    return true;
  };
  fields.forEach((field) => field.addEventListener('blur', () => validate(field)));
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const invalid = fields.filter((field) => !validate(field));
    if (invalid.length) {
      invalid[0].focus();
      status.textContent = 'Please correct the highlighted fields.';
      return;
    }
    const payload = Object.fromEntries(fields.map((field) => [field.name, field.value.trim()]));
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    status.textContent = 'Sending your message…';
    try {
      const result = await api.post('/api/v1/contact', payload);
      form.reset();
      form.elements.formStartedAt.value = String(Date.now());
      status.textContent = result?.message ?? 'Message sent — thank you.';
    } catch (error) {
      status.textContent =
        error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
    }
  });
};

const initTerminal = () => {
  const form = $('#terminal-form');
  const input = $('#terminal-input');
  const output = $('#terminal-output');
  if (!form || !input || !output) return;
  const commands = {
    help: 'Available commands: help, projects, skills, contact, clear, theme #hex.',
    projects: 'The case studies are at /projects — XyroSocial, StudyForge, and XyroBase.',
    skills: 'React · TypeScript · Next.js · Node / Express · Firebase · MongoDB · Cloudflare · Vercel.',
    contact: 'Use the contact page at /contact.',
  };
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const command = input.value.trim();
    const [name, argument] = command.split(/\s+/, 2);
    if (name === 'clear') output.textContent = '';
    else if (name === 'theme' && isHexColor(argument)) {
      const accent = accessibleAccent(argument, document.documentElement.dataset.theme);
      document.documentElement.style.setProperty('--accent-custom', accent);
      document.documentElement.style.setProperty(
        '--accent-custom-contrast',
        contrastRatio(accent, '#111613') > contrastRatio(accent, '#ffffff') ? '#111613' : '#ffffff',
      );
      output.textContent = `Accent changed to ${argument}. Use Customise to save or share it.`;
    } else {
      output.textContent = commands[name] ?? 'Command not recognised. Type help to see what is available.';
    }
    input.value = '';
  });
};

const initCommandPalette = () => {
  const dialog = $('#command-palette');
  const open = $('#palette-open');
  const search = $('#palette-search');
  const results = $('#palette-results');
  if (!dialog || !results) return;

  const actions = [
    { label: 'Home', url: '/' },
    { label: 'About', url: '/about' },
    { label: 'Projects', url: '/projects' },
    { label: 'Uses', url: '/uses' },
    { label: 'Now', url: '/now' },
    { label: 'Writing', url: '/writing' },
    { label: 'Contact', url: '/contact' },
    { label: 'Résumé', url: '/resume' },
    { label: 'Customise appearance', action: () => $('#customise-open')?.click() },
  ];
  let active = 0;
  const render = () => {
    const needle = search.value.trim().toLowerCase();
    const filtered = actions.filter((item) => item.label.toLowerCase().includes(needle));
    results.replaceChildren();
    filtered.forEach((item, index) => {
      const li = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = item.label;
      button.setAttribute('aria-selected', String(index === active));
      button.addEventListener('click', () => {
        if (item.url) location.href = item.url;
        else item.action();
        dialog.close();
      });
      li.append(button);
      results.append(li);
    });
    active = Math.min(active, Math.max(filtered.length - 1, 0));
  };
  const openDialog = () => {
    if (dialog.open) return;
    dialog.showModal();
    search.value = '';
    active = 0;
    render();
    search.focus();
  };
  open?.addEventListener('click', openDialog);
  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      openDialog();
    }
    if (!dialog.open || !['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;
    const buttons = $$('button', results);
    if (event.key === 'ArrowDown') active = (active + 1) % Math.max(buttons.length, 1);
    if (event.key === 'ArrowUp') active = (active - 1 + buttons.length) % Math.max(buttons.length, 1);
    if (event.key === 'Enter' && buttons[active]) {
      event.preventDefault();
      buttons[active].click();
      return;
    }
    render();
    buttons[active]?.focus();
  });
  search?.addEventListener('input', () => {
    active = 0;
    render();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
};

const boot = () => {
  initTheme();
  initNavigation();
  initProjectFilters();
  initContactForm();
  initTerminal();
  initCommandPalette();
  $$('[data-print]').forEach((button) => button.addEventListener('click', () => window.print()));
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
