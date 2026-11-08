import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import profile from '../data/profile.js';
import skills from '../data/skills.js';
import { getAllTags } from '../services/projects.service.js';
import { getProjectBySlug, queryProjects } from '../services/projects.service.js';
import projects from '../data/projects.js';
import config from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, 'home.template.html');
const projectsTemplatePath = path.join(__dirname, 'projects.template.html');
const projectTemplatePath = path.join(__dirname, 'project.template.html');
const siteTemplatePath = path.join(__dirname, 'site.template.html');
const writingDirectory = path.resolve(__dirname, '../../content/writing');
const siteOrigin = config.siteUrl.replace(/\/$/, '');

/* ------------------------------------------------------------------ utils */

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ESCAPE_MAP[char] ?? char);

const toClass = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const absoluteUrl = (pathname = '/') => {
  const origin = config.siteUrl.replace(/\/$/, '');
  const withLeadingSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${origin}${withLeadingSlash}`;
};

/* ---------------------------------------------------------------- socials */

const SOCIAL_ICONS = {
  github: '<path d="M9.2 20.4c-4.3 1.3-4.3-2.2-6-2.6m12 5v-3.4c0-1 .1-1.4-.5-2 2.6-.3 5.1-1.3 5.1-5.6A4.4 4.4 0 0 0 18.6 8a4 4 0 0 0-.1-3.5s-1.1-.3-3.5 1.3a11.9 11.9 0 0 0-6 0C6.6 4.2 5.5 4.5 5.5 4.5A4 4 0 0 0 5.4 8a4.4 4.4 0 0 0-1.2 3.2c0 4.3 2.5 5.3 5.1 5.6-.5.5-.6 1.1-.5 2V22"/>',
  linkedin:
    '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/>',
  x: '<path d="m4 4 16 16M20 4 4 20"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.5 7 8.5 6 8.5-6"/>',
};

const renderSocialLinks = () =>
  profile.socials
    .map(
      (social) => `
        <li>
          <a href="${escapeHtml(social.url)}" ${social.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''} aria-label="${escapeHtml(social.label)} — ${escapeHtml(social.handle)}">
            <svg viewBox="0 0 24 24" aria-hidden="true">${SOCIAL_ICONS[social.icon] ?? ''}</svg>
            <span>${escapeHtml(social.label)}</span>
          </a>
        </li>`,
    )
    .join('');

const renderStackChips = () =>
  skills
    .flatMap((group) => group.items)
    .slice(0, 16)
    .map(
      (tech) => `
        <li class="stack-chip"><span aria-hidden="true">▸</span>${escapeHtml(tech)}</li>`,
    )
    .join('');

/* ---------------------------------------------------------------- skills */

const renderSkillGroups = () =>
  skills
    .map(
      (group, index) => `
        <article class="skill-card" data-reveal style="--delay:${index * 60}ms">
          <header class="skill-head">
            <h3>${escapeHtml(group.title)}</h3>
            <ul class="tag-list" aria-label="Technologies in ${escapeHtml(group.title)}">
              ${group.items.map((item) => `<li class="tag">${escapeHtml(item)}</li>`).join('')}
            </ul>
          </header>
        </article>`,
    )
    .join('');

/* ---------------------------------------------------------------- projects */

const renderTagChips = (limit = 14) =>
  getAllTags()
    .slice(0, limit)
    .map(
      (tag) =>
        `<button class="chip" type="button" data-filter="${escapeHtml(toClass(tag.name))}" aria-pressed="false">${escapeHtml(tag.name)}</button>`,
    )
    .join('');

const renderProjectCards = (items = queryProjects({ limit: 50 }).items) => {
  return items
    .map(
      (project) => `
        <article class="project-card" data-reveal
          data-title="${escapeHtml(project.title.toLowerCase())}"
          data-status="${escapeHtml(project.status)}"
          data-featured="${project.featured ? 'true' : 'false'}"
          data-tags="${escapeHtml((project.tags ?? []).map(toClass).join(' '))}">
          <div class="project-top">
            <span class="project-status status-${toClass(project.status)}">${escapeHtml(project.status)}</span>
          </div>

          <h3 class="project-title"><a href="/projects/${escapeHtml(project.slug)}">${escapeHtml(project.title)}</a></h3>
          <p class="project-summary">${escapeHtml(project.summary)}</p>

          <ul class="tag-list" aria-label="Technologies used">
            ${(project.tags ?? []).slice(0, 6).map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`).join('')}
          </ul>

          <footer class="project-foot">
            <span class="project-role">${escapeHtml(project.role ?? '')}</span>
            <span class="project-links">
              <a class="text-link" href="/projects/${escapeHtml(project.slug)}">Case study <span aria-hidden="true">→</span></a>
              ${(project.links ?? [])
                .filter((link) => isSafeExternalUrl(link.url))
                .slice(0, 1)
                .map(
                  (link) =>
                    `<a class="text-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)} <span aria-hidden="true">↗</span></a>`,
                )
                .join('')}
            </span>
          </footer>
        </article>`,
    )
    .join('');
};

const renderArchitecture = (nodes = []) => {
  if (!nodes.length) return '';
  const width = 720;
  const nodeWidth = Math.min(290, width - 48);
  const nodeHeight = 48;
  const gap = 22;
  const height = nodes.length * (nodeHeight + gap) - gap + 32;
  const shapes = nodes
    .map((node, index) => {
      const x = (width - nodeWidth) / 2;
      const y = 16 + index * (nodeHeight + gap);
      const connector =
        index < nodes.length - 1
          ? `<path class="architecture-edge" d="M${width / 2} ${y + nodeHeight}v${gap}" />`
          : '';
      return `${connector}<rect class="architecture-node" x="${x}" y="${y}" width="${nodeWidth}" height="${nodeHeight}" rx="8"/><text class="architecture-label" x="${width / 2}" y="${y + 30}" text-anchor="middle">${escapeHtml(node)}</text>`;
    })
    .join('');
  return `<svg class="architecture-diagram" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="architecture-title"><title id="architecture-title">Project architecture, from interface to services</title>${shapes}</svg>`;
};

/* ------------------------------------------------------------ json-ld */

const buildPersonSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  alternateName: profile.initials,
  jobTitle: profile.role,
  description: profile.summary,
  url: config.siteUrl,
  image: absoluteUrl('/assets/og-image.svg'),
  email: profile.email,
  knowsAbout: skills.flatMap((group) => group.items),
  sameAs: profile.socials.filter((social) => social.url.startsWith('http')).map((social) => social.url),
});

const buildWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: `${profile.name} — Portfolio`,
  url: config.siteUrl,
  description: profile.summary,
  publisher: { '@type': 'Person', name: profile.name },
});

const buildWebPageSchema = (title, description, pathname) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url: absoluteUrl(pathname),
  isPartOf: { '@id': absoluteUrl('/') },
  about: { '@type': 'Person', name: profile.name },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: title, item: absoluteUrl(pathname) },
    ],
  },
});

const jsonLd = (value) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

const renderBreadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.path),
  })),
});

const renderAccentPresets = () =>
  [
    ['Xyro', '#e744cb'],
    ['Terracotta', '#b45335'],
    ['Ocean', '#176b87'],
    ['Forest', '#35735b'],
    ['Amber', '#a7620a'],
    ['Rose', '#b83f64'],
    ['Indigo', '#5949be'],
    ['Graphite', '#59636a'],
  ]
    .map(
      ([name, color]) =>
        `<button class="accent-swatch" type="button" data-accent="${color}" aria-label="${name}" title="${name}" style="--swatch:${color}"></button>`,
    )
    .join('');

const renderInteractionControls = () => `
  <button class="customise-trigger" id="customise-open" type="button" aria-haspopup="dialog" aria-controls="theme-panel">Customise</button>
  <section class="theme-panel" id="theme-panel" role="dialog" aria-modal="true" aria-labelledby="theme-title" hidden>
    <div class="theme-panel-head"><h2 id="theme-title">Make it yours</h2><button class="icon-btn" id="customise-close" type="button" aria-label="Close customiser">×</button></div>
    <label class="theme-field">Mode<select id="theme-mode"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
    <fieldset class="theme-field"><legend>Accent</legend><div class="accent-presets" id="accent-presets">${renderAccentPresets()}</div></fieldset>
    <label class="theme-field">Custom accent<input id="accent-custom" type="color" value="#b45335"></label>
    <fieldset class="theme-field"><legend>Corner style</legend><div class="choice-row"><label><input type="radio" name="radius" value="sharp"> Sharp</label><label><input type="radio" name="radius" value="soft" checked> Soft</label><label><input type="radio" name="radius" value="round"> Round</label></div></fieldset>
    <fieldset class="theme-field"><legend>Type</legend><div class="choice-row"><label><input type="radio" name="font" value="sans" checked> Sans</label><label><input type="radio" name="font" value="mono"> Mono-leaning</label></div></fieldset>
    <fieldset class="theme-field"><legend>Motion</legend><div class="choice-row"><label><input type="radio" name="motion" value="full" checked> Full</label><label><input type="radio" name="motion" value="reduced"> Reduced</label></div></fieldset>
    <div class="theme-panel-actions"><button class="btn btn-ghost btn-sm" id="theme-reset" type="button">Reset</button><button class="btn btn-ghost btn-sm" id="theme-share" type="button">Copy theme link</button></div>
    <p class="theme-status" id="theme-status" role="status" aria-live="polite"></p>
  </section>
  <dialog class="command-palette" id="command-palette" aria-labelledby="palette-title">
    <h2 class="sr-only" id="palette-title">Command menu</h2><label class="sr-only" for="palette-search">Search pages and actions</label>
    <input id="palette-search" type="search" placeholder="Jump to a page or action…" autocomplete="off"><ul id="palette-results"></ul>
    <p class="palette-hint">↑ ↓ to navigate · Enter to select · Esc to close</p>
  </dialog>`;

const injectInteractionControls = (html) =>
  html.replace('</body>', `${renderInteractionControls()}\n</body>`);

const renderSitePage = async ({ title, description, pathname, content, type = 'website', schema = [] }) => {
  const template = await readFile(siteTemplatePath, 'utf8');
  const replacements = {
    TITLE: escapeHtml(title),
    DESCRIPTION: escapeHtml(description),
    CANONICAL: escapeHtml(absoluteUrl(pathname)),
    OG_TYPE: escapeHtml(type),
    OG_IMAGE: escapeHtml(absoluteUrl('/assets/og-image.svg')),
    STRUCTURED_DATA: schema
      .map((item) => `<script type="application/ld+json" nonce="{{CSP_NONCE}}">${jsonLd(item)}</script>`)
      .join('\n  '),
    ACCENT_PRESETS: renderAccentPresets(),
    CONTENT: content,
    YEAR: String(new Date().getFullYear()),
  };
  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

const renderPageSchema = (title, description, pathname) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url: absoluteUrl(pathname),
  about: { '@type': 'Person', name: profile.name },
});

const isSafeExternalUrl = (value) => {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

/* ----------------------------------------------------------------- render */

export const renderHome = async (githubSnapshot = null) => {
  const template = await readFile(templatePath, 'utf8');
  const repositories = (githubSnapshot?.repositories ?? [])
    .filter((repository) => isSafeExternalUrl(repository.url))
    .slice(0, 4)
    .map(
      (repository) => `
        <li><a href="${escapeHtml(repository.url)}" target="_blank" rel="noopener noreferrer">
          <strong>${escapeHtml(repository.name)}</strong>
          <span>${escapeHtml(repository.description || repository.language || 'GitHub repository')}</span>
        </a></li>`,
    )
    .join('');
  const languages = (githubSnapshot?.languages ?? [])
    .map((language) => `<li class="tag">${escapeHtml(language)}</li>`)
    .join('');
  const activity = (githubSnapshot?.activity ?? [])
    .slice(0, 3)
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join('');
  const githubSection = `${repositories ? `<h3>Recent repositories</h3><ul class="repo-list">${repositories}</ul>` : '<p class="muted">See the project case studies for the work currently listed here.</p>'}${languages ? `<h3>Languages</h3><ul class="tag-list">${languages}</ul>` : ''}${activity ? `<h3>Recent public activity</h3><ul class="activity-list">${activity}</ul>` : ''}`;

  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_SUMMARY: escapeHtml(profile.summary),
    PROFILE_LOCATION: escapeHtml(profile.location),
    PROFILE_TIMEZONE: escapeHtml(profile.timezone),
    PROFILE_EMAIL: escapeHtml(profile.email),
    PROFILE_RESUME_URL: escapeHtml(profile.resumeUrl),
    PROFILE_GITHUB: escapeHtml(profile.github),
    SITE_URL: escapeHtml(absoluteUrl('/')),
    FORM_STARTED_AT: String(Date.now()),
    SOCIAL_LINKS: renderSocialLinks(),
    STACK_CHIPS: renderStackChips(),
    SKILL_GROUPS: renderSkillGroups(),
    FEATURED_PROJECTS: renderProjectCards(queryProjects({ featured: true, limit: 4 }).items),
    GITHUB_SECTION: githubSection,
    JSONLD_PERSON: jsonLd(buildPersonSchema()),
    JSONLD_WEBSITE: jsonLd(buildWebSiteSchema()),
    JSONLD_WEBPAGE: jsonLd(buildWebPageSchema(`${profile.name} — ${profile.role}`, profile.summary, '/')),
    CURRENT_YEAR: String(new Date().getFullYear()),
    ACCENT_PRESETS: renderAccentPresets(),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

const baseSchema = () => [
  buildPersonSchema(),
  buildWebSiteSchema(),
];

const renderStaticPage = (title, description, pathname, content, type = 'website', extraSchema = []) =>
  renderSitePage({
    title: `${title} — ${profile.name}`,
    description,
    pathname,
    type,
    content: `<section class="page-intro section"><div class="container"><p class="breadcrumbs"><a href="/">Home</a><span aria-hidden="true">/</span>${escapeHtml(title)}</p><p class="eyebrow">${escapeHtml(profile.name)}</p><h1>${escapeHtml(title)}.</h1></div></section>${content}`,
    schema: [
      ...baseSchema(),
      renderPageSchema(title, description, pathname),
      renderBreadcrumbSchema([
        { name: 'Home', path: '/' },
        { name: title, path: pathname },
      ]),
      ...extraSchema,
    ],
  });

export const renderAboutPage = async () => {
  const content = `<section class="section"><div class="container reading-width"><p class="section-lead">${escapeHtml(profile.summary)} The work shown here is centered on products I am building as an independent developer and founder.</p><h2>Building the Xyro products</h2><p>XyroSocial is a live social platform and XyroBase is the product home for the Xyro suite. XyroConnect and XyroBrowse are in development; XyroDrive is planned.</p><h2>How I work</h2><p>I focus on the product details, system boundaries and safe defaults that help software stay useful as it grows.</p><h2>A small terminal</h2><p>Try <code>help</code>, <code>projects</code>, <code>skills</code>, <code>contact</code> or <code>theme #hex</code>.</p><div class="terminal" id="terminal"><p id="terminal-output" class="terminal-output" aria-live="polite">Type help to see what this terminal can do.</p><form id="terminal-form"><label class="sr-only" for="terminal-input">Terminal command</label><span aria-hidden="true">&gt;</span><input id="terminal-input" type="text" autocomplete="off" spellcheck="false"><button class="sr-only" type="submit">Run command</button></form></div></div></section>`;
  return renderStaticPage('About', profile.summary, '/about', content);
};

export const renderUsesPage = async () => {
  const content = `<section class="section section-alt"><div class="container reading-width"><p class="section-lead">Technologies used in the public projects listed here. Hardware and personal setup details are not published.</p><div class="skills-grid">${renderSkillGroups()}</div></div></section>`;
  return renderStaticPage('Uses', 'Technologies used in Mostakim Adib’s public projects.', '/uses', content);
};

export const renderNowPage = async () => {
  const planned = projects.flatMap((project) =>
    (project.products ?? [])
      .filter((product) => ['In development', 'Planned'].includes(product.status))
      .map(
        (product) =>
          `<li><strong>${escapeHtml(product.name)}</strong> — ${escapeHtml(product.status)}${product.description ? `: ${escapeHtml(product.description)}` : ''}</li>`,
      ),
  );
  const content = `<section class="section"><div class="container reading-width"><p class="section-lead">A snapshot of product work with a public status supplied for this portfolio.</p><h2>In development or planned</h2><ul class="case-highlights">${planned.join('')}</ul><p class="muted">No personal updates beyond the verified product statuses are included.</p></div></section>`;
  return renderStaticPage('Now', 'A snapshot of public product work by Mostakim Adib.', '/now', content);
};

const parseWritingFile = (source, slug) => {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  const metadata = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([a-zA-Z]+):\s*(.*?)\s*$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.replace(/^["']|["']$/g, '')]),
  );
  const date = metadata.date;
  const parsedDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
  if (
    !metadata.title ||
    !parsedDate ||
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date ||
    metadata.draft === 'true'
  ) {
    return null;
  }
  return { slug, title: metadata.title, date, description: metadata.description || metadata.title, body: match[2] };
};

const getWritingPosts = async () => {
  let names;
  try {
    names = await readdir(writingDirectory);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
  const posts = await Promise.all(
    names
      .filter((name) => name.endsWith('.md'))
      .map(async (name) =>
        parseWritingFile(await readFile(path.join(writingDirectory, name), 'utf8'), name.slice(0, -3)),
      ),
  );
  return posts.filter(Boolean).sort((left, right) => right.date.localeCompare(left.date));
};

const renderMarkdown = (markdown) =>
  markdown
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const heading = block.match(/^(#{1,3})\s+(.+)$/);
      if (heading) {
        const level = heading[1].length + 1;
        return `<h${level}>${escapeHtml(heading[2])}</h${level}>`;
      }
      if (block.split('\n').every((line) => /^-\s+/.test(line))) {
        return `<ul>${block
          .split('\n')
          .map((line) => `<li>${escapeHtml(line.replace(/^-\s+/, ''))}</li>`)
          .join('')}</ul>`;
      }
      return `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`;
    })
    .join('');

export const renderWritingPage = async () => {
  const posts = await getWritingPosts();
  const list = posts.length
    ? `<ul class="writing-list">${posts
        .map(
          (post) =>
            `<li><time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time><a href="/writing/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></li>`,
        )
        .join('')}</ul>`
    : '<p class="section-lead">No articles published yet.</p>';
  const content = `<section class="section"><div class="container reading-width">${list}<p><a class="text-link" href="/rss.xml">RSS feed <span aria-hidden="true">↗</span></a></p></div></section>`;
  return renderStaticPage('Writing', 'Notes and articles by Mostakim Adib.', '/writing', content);
};

export const renderWritingPost = async (slug) => {
  const post = (await getWritingPosts()).find((item) => item.slug === slug);
  if (!post) return null;
  const content = `<article class="section"><div class="container reading-width"><p class="breadcrumbs"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/writing">Writing</a><span aria-hidden="true">/</span>${escapeHtml(post.title)}</p><p class="eyebrow"><time datetime="${escapeHtml(post.date)}">${escapeHtml(post.date)}</time></p><h1>${escapeHtml(post.title)}</h1><div class="prose">${renderMarkdown(post.body)}</div></div></article>`;
  return renderSitePage({
    title: `${post.title} — ${profile.name}`,
    description: post.description,
    pathname: `/writing/${encodeURIComponent(post.slug)}`,
    type: 'article',
    content,
    schema: [
      ...baseSchema(),
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        datePublished: post.date,
        description: post.description,
        author: { '@type': 'Person', name: profile.name },
        url: absoluteUrl(`/writing/${encodeURIComponent(post.slug)}`),
      },
    ],
  });
};

export const renderContactPage = async () => {
  const content = `<section class="section section-alt"><div class="container contact-grid"><div><p class="section-lead">The form is the best way to reach me. You can also email <a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a>.</p><p>Based in ${escapeHtml(profile.location)}.</p></div><form class="contact-form" id="contact-form" novalidate><div class="field"><label for="cf-name">Name</label><input id="cf-name" name="name" autocomplete="name" required minlength="2" maxlength="80"><p class="field-error" data-error-for="name" role="alert"></p></div><div class="field"><label for="cf-email">Your email</label><input id="cf-email" name="email" type="email" autocomplete="email" required maxlength="120"><p class="field-error" data-error-for="email" role="alert"></p></div><div class="field"><label for="cf-subject">Subject <span class="optional">(optional)</span></label><input id="cf-subject" name="subject" maxlength="140"><p class="field-error" data-error-for="subject" role="alert"></p></div><div class="field"><label for="cf-message">Message</label><textarea id="cf-message" name="message" rows="6" required minlength="10" maxlength="4000"></textarea><p class="field-error" data-error-for="message" role="alert"></p></div><input type="hidden" name="formStartedAt" value="${Date.now()}"><div class="honeypot" aria-hidden="true"><label for="cf-company">Company</label><input id="cf-company" name="company" tabindex="-1" autocomplete="off"></div><button class="btn btn-primary" id="cf-submit" type="submit">Send message</button><p class="form-status" id="form-status" role="status" aria-live="polite"></p></form></div></section>`;
  return renderStaticPage('Contact', 'Contact Mostakim Adib about public projects and product work.', '/contact', content);
};

export const renderResumePage = async () => {
  const projectList = projects
    .map(
      (project) =>
        `<li><strong>${escapeHtml(project.title)}</strong> — ${escapeHtml(project.summary)} <a href="${escapeHtml(absoluteUrl(`/projects/${project.slug}`))}">${escapeHtml(absoluteUrl(`/projects/${project.slug}`))}</a></li>`,
    )
    .join('');
  const content = `<article class="section resume-page"><div class="container reading-width"><div class="resume-actions"><a class="text-link" href="/contact">Contact</a><button class="btn btn-primary" type="button" data-print>Print / Save as PDF</button></div><header class="resume-header"><h1>${escapeHtml(profile.name)}</h1><p>${escapeHtml(profile.role)}</p><p>${escapeHtml(profile.location)} · <a href="mailto:${escapeHtml(profile.email)}">${escapeHtml(profile.email)}</a> · <a href="${escapeHtml(profile.github)}">${escapeHtml(profile.github.replace('https://', ''))}</a></p></header><section><h2>Profile</h2><p>${escapeHtml(profile.summary)}</p></section><section><h2>Selected products</h2><ul>${projectList}</ul></section><section><h2>Skills</h2>${skills.map((group) => `<p><strong>${escapeHtml(group.title)}:</strong> ${escapeHtml(group.items.join(', '))}</p>`).join('')}</section></div></article>`;
  return renderStaticPage('Résumé', `${profile.name} — ${profile.role}.`, '/resume', content);
};

export const renderNotFound = async () =>
  renderStaticPage(
    'Page not found',
    'The page you requested could not be found.',
    '/404',
    '<section class="error-page"><div class="container"><p class="eyebrow">404 / Not found</p><h2>Nothing lives here.</h2><p>The page may have moved, or the address might be off.</p><a class="btn btn-primary" href="/">Back home</a></div></section>',
  );

export const renderServerError = async () =>
  renderStaticPage(
    'Something went wrong',
    'The page could not be served.',
    '/500',
    '<section class="error-page"><div class="container"><p class="eyebrow">500 / Server error</p><h2>That did not work.</h2><p>Please try again shortly.</p><a class="btn btn-primary" href="/">Back home</a></div></section>',
  );

export const renderProjectsPage = async () => {
  const template = await readFile(projectsTemplatePath, 'utf8');
  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_RESUME_URL: escapeHtml(profile.resumeUrl),
    SITE_URL: escapeHtml(config.siteUrl.replace(/\/$/, '')),
    TAG_CHIPS: renderTagChips(Infinity),
    PROJECT_CARDS: renderProjectCards(projects),
    PROJECT_COUNT: String(projects.length),
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export const renderProjectPage = async (slug) => {
  const project = getProjectBySlug(slug);
  if (!project) return null;
  const index = projects.findIndex((item) => item.slug === project.slug);
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const next = projects[(index + 1) % projects.length];

  const template = await readFile(projectTemplatePath, 'utf8');
  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_RESUME_URL: escapeHtml(profile.resumeUrl),
    SITE_URL: escapeHtml(config.siteUrl.replace(/\/$/, '')),
    PROJECT_TITLE: escapeHtml(project.title),
    PROJECT_SLUG: encodeURIComponent(project.slug),
    PROJECT_SUMMARY: escapeHtml(project.summary),
    PROJECT_STATUS: escapeHtml(project.status),
    PROJECT_ROLE: escapeHtml(project.role ?? ''),
    PROJECT_DESCRIPTION: escapeHtml(project.description),
    PROJECT_PROBLEM: escapeHtml(project.problem),
    PROJECT_DECISIONS: (project.decisions ?? []).map((decision) => `<li>${escapeHtml(decision)}</li>`).join(''),
    PROJECT_ARCHITECTURE: project.architecture?.length
      ? `<section class="case-section" aria-labelledby="case-architecture"><p class="eyebrow">03 — Architecture</p><h2 id="case-architecture">How the pieces fit together</h2>${renderArchitecture(project.architecture)}</section>`
      : '',
    PROJECT_FIXES: project.fixes?.length
      ? `<section class="case-section" aria-labelledby="case-fixes"><p class="eyebrow">04 — Engineering notes</p><h2 id="case-fixes">What changed and why</h2><ul class="case-highlights">${project.fixes.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`
      : '',
    PREVIOUS_SLUG: encodeURIComponent(previous.slug),
    PREVIOUS_TITLE: escapeHtml(previous.title),
    NEXT_SLUG: encodeURIComponent(next.slug),
    NEXT_TITLE: escapeHtml(next.title),
    PROJECT_STACK: (project.stack ?? []).map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`).join(''),
    PROJECT_PRODUCTS: (project.products ?? [])
      .map(
        (product) => `
          <li class="product-item">
            <strong>${escapeHtml(product.name)}</strong>
            <span class="product-status">${escapeHtml(product.status)}</span>
            <p>${escapeHtml(product.description ?? '')}</p>
          </li>`,
      )
      .join(''),
    PROJECT_LINKS: (project.links ?? [])
      .filter((link) => isSafeExternalUrl(link.url))
      .map(
        (link) =>
          `<li><a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a></li>`,
      )
      .join(''),
    PROJECT_SCHEMA: jsonLd({
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      description: project.summary,
      creator: { '@type': 'Person', name: profile.name },
      url: absoluteUrl(`/projects/${project.slug}`),
    }),
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export const renderSitemap = async () => {
  const [profileFile, projectFile, posts] = await Promise.all([
    stat(new URL('../data/profile.js', import.meta.url)),
    stat(new URL('../data/projects.js', import.meta.url)),
    getWritingPosts(),
  ]);
  const lastmod = new Date(Math.max(profileFile.mtimeMs, projectFile.mtimeMs)).toISOString().slice(0, 10);
  const locations = [
    '/',
    '/about',
    '/projects',
    '/uses',
    '/now',
    '/writing',
    '/contact',
    '/resume',
    ...projects.map((project) => `/projects/${encodeURIComponent(project.slug)}`),
    ...posts.map((post) => `/writing/${encodeURIComponent(post.slug)}`),
  ];
  const urls = locations
    .map(
      (location) =>
        `<url><loc>${escapeHtml(absoluteUrl(location))}</loc><lastmod>${lastmod}</lastmod></url>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
};

export const renderRss = async () => {
  const posts = await getWritingPosts();
  const items = posts
    .map(
      (post) =>
        `<item><title>${escapeHtml(post.title)}</title><link>${escapeHtml(absoluteUrl(`/writing/${encodeURIComponent(post.slug)}`))}</link><guid>${escapeHtml(absoluteUrl(`/writing/${encodeURIComponent(post.slug)}`))}</guid><pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate><description>${escapeHtml(post.description)}</description></item>`,
    )
    .join('');
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${escapeHtml(profile.name)} — Writing</title><link>${escapeHtml(absoluteUrl('/writing'))}</link><description>Notes by ${escapeHtml(profile.name)}.</description>${items}</channel></rss>`;
};

export const renderResume = renderResumePage;

export default {
  renderHome,
  renderProjectsPage,
  renderProjectPage,
  renderSitemap,
  renderResume,
  renderAboutPage,
  renderUsesPage,
  renderNowPage,
  renderWritingPage,
  renderWritingPost,
  renderContactPage,
  renderResumePage,
  renderRss,
  renderNotFound,
  renderServerError,
};
