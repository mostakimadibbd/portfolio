(() => {
  const defaults = { mode: 'system', accent: '#b45335', radius: 'soft', font: 'sans', motion: 'full' };
  const allowed = {
    mode: ['system', 'light', 'dark'],
    radius: ['sharp', 'soft', 'round'],
    font: ['sans', 'mono'],
    motion: ['full', 'reduced'],
  };
  const hex = (value) => /^#[\da-f]{6}$/i.test(value);
  let theme = { ...defaults };
  try {
    const stored = JSON.parse(localStorage.getItem('ma-portfolio-theme-v1') || 'null');
    if (stored && typeof stored === 'object') theme = { ...theme, ...stored };
  } catch {
    // Theme storage is optional; the system preference remains available.
  }

  const params = new URLSearchParams(location.search);
  if (params.has('accent') || params.has('mode') || params.has('radius')) {
    theme = { ...defaults };
    for (const key of Object.keys(allowed)) {
      const value = params.get(key);
      if (value && allowed[key].includes(value)) theme[key] = value;
    }
    if (hex(params.get('accent') || '')) theme.accent = params.get('accent');
  }
  if (!hex(theme.accent)) theme.accent = defaults.accent;
  for (const key of Object.keys(allowed)) {
    if (!allowed[key].includes(theme[key])) theme[key] = defaults[key];
  }

  const dark =
    theme.mode === 'dark' ||
    (theme.mode === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  const background = dark ? '#111613' : '#fbfaf7';
  const channels = (color) => [1, 3, 5].map((index) => parseInt(color.slice(index, index + 2), 16) / 255);
  const luminance = (color) =>
    channels(color)
      .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
      .reduce((sum, channel, index) => sum + channel * [0.2126, 0.7152, 0.0722][index], 0);
  const ratio = (first, second) => {
    const [light, darkValue] = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (light + 0.05) / (darkValue + 0.05);
  };
  const accentChannels = channels(theme.accent).map((channel) => channel * 255);
  let accent = theme.accent;
  if (ratio(accent, background) < 4.5) {
    for (let step = 1; step <= 100; step += 1) {
      const amount = step / 100;
      const values = accentChannels.map((channel) =>
        dark ? channel + (255 - channel) * amount : channel * (1 - amount),
      );
      const candidate = `#${values.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
      if (ratio(candidate, background) >= 4.5) {
        accent = candidate;
        break;
      }
    }
  }
  const root = document.documentElement;
  root.dataset.theme = dark ? 'dark' : 'light';
  root.dataset.radius = theme.radius;
  root.dataset.font = theme.font;
  root.dataset.motion = theme.motion;
  root.style.setProperty('--accent-custom', accent);
  root.style.setProperty(
    '--accent-custom-contrast',
    ratio(accent, '#111613') > ratio(accent, '#ffffff') ? '#111613' : '#ffffff',
  );
  document.querySelector('#theme-color')?.setAttribute('content', dark ? '#111613' : '#fbfaf7');
})();
