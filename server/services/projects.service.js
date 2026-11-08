import projects from '../data/projects.js';

const projectTags = (project) => project.stack ?? [];
const searchableText = (project) =>
  [project.title, project.summary, project.description, ...(project.alternateNames ?? []), ...projectTags(project)]
    .join(' ')
    .toLowerCase();
const withLegacyTags = (project) => ({ ...project, tags: projectTags(project) });

/**
 * Filters and paginates the project catalogue.
 */
export const queryProjects = ({ featured, tag, search, page = 1, limit = 12 } = {}) => {
  let result = [...projects];

  if (featured !== undefined) result = result.filter((project) => project.featured === featured);

  if (tag) {
    const needle = tag.toLowerCase();
    result = result.filter((project) => projectTags(project).some((item) => item.toLowerCase() === needle));
  }

  if (search) {
    const needle = search.toLowerCase();
    result = result.filter((project) => searchableText(project).includes(needle));
  }

  const total = result.length;
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const offset = (safePage - 1) * safeLimit;

  return {
    items: result.slice(offset, offset + safeLimit).map(withLegacyTags),
    meta: { total, page: safePage, limit: safeLimit, totalPages, hasNext: safePage < totalPages },
  };
};

export const getProjectBySlug = (slug) => {
  const project = projects.find((item) => item.slug === slug);
  return project ? withLegacyTags(project) : null;
};

export const getAllTags = () => {
  const counts = new Map();
  for (const project of projects) {
    for (const tag of projectTags(project)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
};

export const getProjectStats = () => ({
  total: projects.length,
  featured: projects.filter((project) => project.featured).length,
  technologies: getAllTags().length,
});

export default { queryProjects, getProjectBySlug, getAllTags, getProjectStats };
