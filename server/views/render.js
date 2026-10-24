import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import profile from '../data/profile.js';
import skills from '../data/skills.js';
import experience from '../data/experience.js';
import { certifications, education, speaking } from '../data/certifications.js';
import { getAllTags } from '../services/projects.service.js';
import { queryProjects } from '../services/projects.service.js';
import config from '../config/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.join(__dirname, 'home.template.html');

/* ------------------------------------------------------------------ utils */

const ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => ESCAPE_MAP[char] ?? char);

const toClass = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

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

const renderStackChips = () => {
  const core = [
    'Python',
    'TypeScript',
    'PyTorch',
    'scikit-learn',
    'Node.js',
    'React',
    'PostgreSQL',
    'Docker',
    'Kubernetes',
    'AWS',
    'FastAPI',
    'MLflow',
  ];
  return core
    .map(
      (tech) => `<li class="stack-chip"><span aria-hidden="true">▸</span>${escapeHtml(tech)}</li>`,
    )
    .join('');
};

/* ------------------------------------------------------------------ about */

const renderFocusCards = () =>
  profile.focusAreas
    .map(
      (area, index) => `
        <article class="focus-card" data-reveal style="--delay:${index * 70}ms">
          <span class="focus-index" aria-hidden="true">0${index + 1}</span>
          <h3>${escapeHtml(area.title)}</h3>
          <p>${escapeHtml(area.description)}</p>
        </article>`,
    )
    .join('');

const renderHighlightCards = () =>
  profile.highlights
    .map(
      (highlight, index) => `
        <article class="highlight-card" data-reveal style="--delay:${index * 70}ms">
          <p class="highlight-metric">${escapeHtml(highlight.metric)}</p>
          <p class="highlight-label">${escapeHtml(highlight.label)}</p>
          <p class="highlight-detail">${escapeHtml(highlight.detail)}</p>
        </article>`,
    )
    .join('');

/* ----------------------------------------------------------------- skills */

const renderSkillCards = () =>
  skills
    .map(
      (group, index) => `
        <article class="skill-card" data-reveal style="--delay:${index * 60}ms">
          <header class="skill-head">
            <h3>${escapeHtml(group.title)}</h3>
            <p>${escapeHtml(group.summary)}</p>
          </header>
          <ul class="skill-list">
            ${group.items
              .map(
                (item) => `
              <li class="skill-item">
                <div class="skill-item-top">
                  <span class="skill-name">${escapeHtml(item.name)}</span>
                  <span class="skill-level">${item.level}%</span>
                </div>
                <div class="meter" role="meter" aria-valuenow="${item.level}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(item.name)} proficiency">
                  <span class="meter-fill" style="--value:${item.level}%"></span>
                </div>
                <p class="skill-note">${escapeHtml(item.note)}</p>
              </li>`,
              )
              .join('')}
          </ul>
        </article>`,
    )
    .join('');

/* ------------------------------------------------------------- experience */

const renderExperienceItems = () =>
  experience
    .map(
      (role) => `
        <li class="timeline-item" data-reveal>
          <div class="timeline-marker" aria-hidden="true"></div>
          <div class="timeline-card">
            <p class="timeline-period">${escapeHtml(role.start)} — ${escapeHtml(role.end)}</p>
            <h3 class="timeline-role">${escapeHtml(role.role)}</h3>
            <p class="timeline-company">${escapeHtml(role.company)} <span aria-hidden="true">·</span> <span class="timeline-type">${escapeHtml(role.employmentType)}</span></p>
            <p class="timeline-summary">${escapeHtml(role.summary)}</p>
            <ul class="achievement-list">
              ${role.achievements.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
            <ul class="tag-list" aria-label="Technologies used">
              ${role.stack.map((tech) => `<li class="tag">${escapeHtml(tech)}</li>`).join('')}
            </ul>
          </div>
        </li>`,
    )
    .join('');

/* --------------------------------------------------------------- projects */

const renderTagChips = () =>
  getAllTags()
    .slice(0, 14)
    .map(
      (tag) =>
        `<button class="chip" type="button" data-filter="${escapeHtml(toClass(tag.name))}" aria-pressed="false">${escapeHtml(tag.name)}</button>`,
    )
    .join('');

const renderProjectCards = () => {
  const { items } = queryProjects({ limit: 50 });

  return items
    .map(
      (project) => `
        <article class="project-card" data-reveal
          data-title="${escapeHtml(project.title.toLowerCase())}"
          data-year="${project.year}"
          data-status="${escapeHtml(project.status)}"
          data-featured="${project.featured ? 'true' : 'false'}"
          data-tags="${escapeHtml(project.tags.map(toClass).join(' '))}">
          <div class="project-top">
            <span class="project-year">${project.year}</span>
            <span class="project-status status-${toClass(project.status)}">${escapeHtml(project.status)}</span>
          </div>

          <h3 class="project-title">${escapeHtml(project.title)}</h3>
          <p class="project-summary">${escapeHtml(project.summary)}</p>

          <dl class="project-metrics">
            ${project.metrics
              .map(
                (metric) => `
              <div>
                <dt>${escapeHtml(metric.label)}</dt>
                <dd>${escapeHtml(metric.value)}</dd>
              </div>`,
              )
              .join('')}
          </dl>

          <ul class="tag-list" aria-label="Technologies used">
            ${project.tags.slice(0, 6).map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`).join('')}
          </ul>

          <footer class="project-foot">
            <span class="project-role">${escapeHtml(project.role)}</span>
            ${
              project.links?.repo
                ? `<a class="text-link" href="${escapeHtml(project.links.repo)}" target="_blank" rel="noopener noreferrer">Source <span aria-hidden="true">↗</span></a>`
                : '<span class="text-link is-muted">Private repository</span>'
            }
          </footer>
        </article>`,
    )
    .join('');
};

/* ------------------------------------------------------------ credentials */

const renderEducationItems = () =>
  education
    .map(
      (item) => `
        <div class="education-item">
          <p class="education-period">${item.start} — ${item.end}</p>
          <h4>${escapeHtml(item.degree)}</h4>
          <p class="education-institution">${escapeHtml(item.institution)} <span aria-hidden="true">·</span> ${escapeHtml(item.location)}</p>
          <p class="education-detail">${escapeHtml(item.detail)}</p>
        </div>`,
    )
    .join('');

const renderCertificationItems = () =>
  certifications
    .map(
      (cert) => `
        <li class="cert-item">
          <svg class="cert-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="9" r="5.5"/><path d="m8.2 13.4-1.4 7 5.2-2.6 5.2 2.6-1.4-7"/></svg>
          <div>
            <strong>${escapeHtml(cert.title)}</strong>
            <small>${escapeHtml(cert.issuer)} · ${cert.year} · ${escapeHtml(cert.credential)}</small>
          </div>
        </li>`,
    )
    .join('');

const renderSpeakingItems = () =>
  speaking
    .map(
      (talk) => `
        <li class="cert-item">
          <svg class="cert-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v10H9l-5 4z"/></svg>
          <div>
            <strong>${escapeHtml(talk.title)}</strong>
            <small>${escapeHtml(talk.event)} · ${talk.date} · ${escapeHtml(talk.type)}</small>
          </div>
        </li>`,
    )
    .join('');

/* ---------------------------------------------------------------- json-ld */

const escapeJson = (value = '') =>
  String(value).replace(/[\\]/g, '\\\\').replace(/["]/g, '\\"').replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r').replace(/[\t]/g, '\\t');

const buildPersonSchema = () => {
  const sameAs = profile.socials
    .filter((s) => s.url.startsWith('http'))
    .map((s) => s.url);

  const knowsAbout = skills.flatMap((g) => g.items.map((i) => i.name));

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    alternateName: profile.initials,
    jobTitle: [profile.role, profile.secondaryRole],
    description: profile.summary,
    url: config.siteUrl,
    image: `${config.siteUrl}/assets/og-image.svg`,
    email: profile.email,
    knowsAbout,
    sameAs,
    alumniOf: education.map((e) => ({
      '@type': 'EducationalOrganization',
      name: e.institution,
    })),
    worksFor: experience
      .filter((e) => e.end === 'Present')
      .map((e) => ({
        '@type': 'Organization',
        name: e.company,
        description: e.summary,
      })),
  };

  return JSON.stringify(person);
};

const buildWebSiteSchema = () => {
  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: `${profile.name} — Portfolio`,
    url: config.siteUrl,
    description: profile.summary,
    publisher: {
      '@type': 'Person',
      name: profile.name,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${config.siteUrl}/#projects?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
  return JSON.stringify(website);
};

const buildWebPageSchema = () => {
  const webpage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${config.siteUrl}/#webpage`,
    name: `${profile.name} — ${profile.role} & ${profile.secondaryRole}`,
    description: profile.summary,
    url: config.siteUrl,
    isPartOf: { '@id': `${config.siteUrl}/#website` },
    about: {
      '@type': 'Person',
      name: profile.name,
    },
    mainEntity: {
      '@type': 'Person',
      name: profile.name,
      jobTitle: profile.role,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: config.siteUrl },
      ],
    },
  };
  return JSON.stringify(webpage);
};

/* ----------------------------------------------------------------- render */

export const renderHome = async () => {
  const template = await readFile(templatePath, 'utf8');

  const replacements = {
    PROFILE_NAME: profile.name,
    PROFILE_INITIALS: profile.initials,
    PROFILE_ROLE: profile.role,
    PROFILE_SECONDARY_ROLE: profile.secondaryRole,
    PROFILE_SUMMARY: profile.summary,
    PROFILE_AVAILABILITY: profile.availability,
    PROFILE_LOCATION: profile.location,
    PROFILE_TIMEZONE: profile.timezone,
    PROFILE_EMAIL: profile.email,
    PROFILE_LOCATION_URL: profile.locationUrl,
    PROFILE_RESUME_URL: profile.resumeUrl,
    PROFILE_EXPERIENCE_YEARS: profile.yearsExperience,
    PROFILE_PROJECTS: profile.projectsShipped,
    PROFILE_MODELS: profile.modelsInProduction,
    PROFILE_TALKS: profile.papersAndTalks,
    PROFILE_FOCUS: 'Applied ML, MLOps, production inference',
    PROFILE_LEARNING: profile.currentlyLearning.join(', '),
    SOCIAL_LINKS: renderSocialLinks(),
    STACK_CHIPS: renderStackChips(),
    FOCUS_CARDS: renderFocusCards(),
    HIGHLIGHT_CARDS: renderHighlightCards(),
    SKILL_CARDS: renderSkillCards(),
    EXPERIENCE_ITEMS: renderExperienceItems(),
    TAG_CHIPS: renderTagChips(),
    PROJECT_CARDS: renderProjectCards(),
    EDUCATION_ITEMS: renderEducationItems(),
    CERTIFICATION_ITEMS: renderCertificationItems(),
    SPEAKING_ITEMS: renderSpeakingItems(),
    JSONLD_PERSON: buildPersonSchema(),
    JSONLD_WEBSITE: buildWebSiteSchema(),
    JSONLD_WEBPAGE: buildWebPageSchema(),
  };

  return Object.entries(replacements).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, value),
    template,
  );
};

export default renderHome;
