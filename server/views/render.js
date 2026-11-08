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
const resumeTemplatePath = path.join(__dirname, 'resume.template.html');
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

const escapeJson = (value = '') =>
  JSON.stringify(String(value))
    .replace(/</g, '\\u003C')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t');

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

const renderResumeSkills = () =>
  skills
    .map(
      (group) => `
        <div class="resume-skill-group">
          <h3>${escapeHtml(group.title)}</h3>
          <ul class="resume-skill-list">
            ${group.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
          </ul>
        </div>`,
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

export const renderAboutPage = async () => {
  const template = await readFile(path.join(__dirname, 'about.template.html'), 'utf8');
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
    SKILL_GROUPS: renderSkillGroups(),
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export const renderUsesPage = async () => {
  const template = await readFile(path.join(__dirname, 'uses.template.html'), 'utf8');
  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_SUMMARY: escapeHtml(profile.summary),
    SKILLS: renderSkillGroups(),
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export const renderNowPage = async () => {
  const template = await readFile(path.join(__dirname, 'now.template.html'), 'utf8');
  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_SUMMARY: escapeHtml(profile.summary),
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export const renderWritingPage = async () => {
  const template = await readFile(path.join(__dirname, 'writing.template.html'), 'utf8');
  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_SUMMARY: escapeHtml(profile.summary),
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export const renderWritingPost = async (slug) => {
  const template = await readFile(path.join(__dirname, 'writing-post.template.html'), 'utf8');
  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_SUMMARY: escapeHtml(profile.summary),
    POST_TITLE: escapeHtml(`Post: ${slug}`),
    POST_CONTENT: '<p>Post content would go here</p>',
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export const renderContactPage = async () => {
  const template = await readFile(path.join(__dirname, 'contact.template.html'), 'utf8');
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
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export const renderResumePage = async () => {
  const template = await readFile(resumeTemplatePath, 'utf8');
  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_SUMMARY: escapeHtml(profile.summary),
    PROFILE_LOCATION: escapeHtml(profile.location),
    PROFILE_EMAIL: escapeHtml(profile.email),
    PROFILE_GITHUB: escapeHtml(profile.github),
    RESUME_SKILLS: renderResumeSkills(),
    PROJECTS_LIST: projects
      .map(
        (project) => `
          <article class="resume-project">
            <h3>${escapeHtml(project.title)}</h3>
            <p class="resume-project-meta">${escapeHtml(project.status)}</p>
            <p>${escapeHtml(project.summary)}</p>
            <ul>
              ${(project.decisions ?? []).map((decision) => `<li>${escapeHtml(decision)}</li>`).join('')}
            </ul>
          </article>`,
      )
      .join(''),
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export const renderRss = () => {
  const origin = config.siteUrl.replace(/\/$/, '');
  const projectUrls = projects
    .map(
      (project) => `
<item>
<guid>${escapeHtml(`${origin}/projects/${encodeURIComponent(project.slug)}`)}</guid>
<title>${escapeHtml(project.title)}</title>
<description>${escapeHtml(project.summary)}</description>
<pubDate>${new Date().toUTCString()}</pubDate>
</item>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>Mostakim Adib — Portfolio</title>
  <link>${escapeHtml(origin)}/</link>
  <description>Selected engineering and product projects</description>
  <pubDate>${new Date().toUTCString()}</pubDate>
${projectUrls}
</channel>
</rss>`;
};

export const renderNotFound = async () => {
  const template = await readFile(path.join(__dirname, '404.template.html'), 'utf8');
  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_SUMMARY: escapeHtml(profile.summary),
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export const renderServerError = async (error) => {
  const template = await readFile(path.join(__dirname, '500.template.html'), 'utf8');
  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_SUMMARY: escapeHtml(profile.summary),
    ERROR_MESSAGE: escapeHtml(error.message || 'Internal Server Error'),
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

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

export const renderSitemap = () => {
  const origin = config.siteUrl.replace(/\/$/, '');
  const projectUrls = projects
    .map(
      (project) => `
  <url>
    <loc>${escapeHtml(`${origin}/projects/${encodeURIComponent(project.slug)}`)}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${project.featured ? '0.8' : '0.6'}</priority>
  </url>`,
    )
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${escapeHtml(origin)}/</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${escapeHtml(`${origin}/projects`)}</loc>
    <lastmod>${new Date().toISOString().slice(0, 10)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>${projectUrls}
</urlset>`;
};

export const renderResume = async () => {
  const template = await readFile(resumeTemplatePath, 'utf8');
  const replacements = {
    PROFILE_NAME: escapeHtml(profile.name),
    PROFILE_INITIALS: escapeHtml(profile.initials),
    PROFILE_ROLE: escapeHtml(profile.role),
    PROFILE_SUMMARY: escapeHtml(profile.summary),
    PROFILE_LOCATION: escapeHtml(profile.location),
    PROFILE_EMAIL: escapeHtml(profile.email),
    PROFILE_GITHUB: escapeHtml(profile.github),
    RESUME_SKILLS: renderResumeSkills(),
    PROJECTS_LIST: projects
      .map(
        (project) => `
          <article class="resume-project">
            <h3>${escapeHtml(project.title)}</h3>
            <p class="resume-project-meta">${escapeHtml(project.status)}</p>
            <p>${escapeHtml(project.summary)}</p>
            <ul>
              ${(project.decisions ?? []).map((decision) => `<li>${escapeHtml(decision)}</li>`).join('')}
            </ul>
          </article>`,
      )
      .join(''),
    CURRENT_YEAR: String(new Date().getFullYear()),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

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
