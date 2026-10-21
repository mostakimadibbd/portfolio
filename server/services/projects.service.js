import projects from '../data/projects.js';

/**
 * Filters and paginates the project catalogue.
 */
export const queryProjects = ({ featured, tag, search, page = 1, limit = 12 } = {}) => {
  let result = [...projects];

  if (featured !== undefined) result = result.filter((project) => project.featured === featured);

  if (tag) {
    const needle = tag.toLowerCase();
    result = result.filter((project) =>
      project.tags.some((item) => item.toLowerCase() === needle),
    );
  }

  if (search) {
    const needle = search.toLowerCase();
    result = result.filter((project) =>
      [project.title, project.summary, project.description, ...project.tags]
        .join(' ')
        .toLowerCase()
        .includes(needle),
    );
  }

  const total = result.length;
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const totalPages = Math.max(Math.ceil(total / safeLimit), 1);
  const safePage = Math.min(Math.max(page, 1), totalPages);
  const offset = (safePage - 1) * safeLimit;

  return {
    items: result.slice(offset, offset + safeLimit),
    meta: { total, page: safePage, limit: safeLimit, totalPages, hasNext: safePage < totalPages },
  };
};

export const getProjectBySlug = (slug) => projects.find((project) => project.slug === slug) ?? null;

export const getAllTags = () => {
  const counts = new Map();
  for (const project of projects) {
    for (const tag of project.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
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
