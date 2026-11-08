import projects from '../data/projects.js';
import logger from '../utils/logger.js';

const ACCOUNT = 'mostakimadibbd';
const CACHE_TTL = 15 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 1500;

let cachedSnapshot;
let cachedAt = 0;
let refreshPromise;

const fallbackSnapshot = () => ({
  repositories: projects
    .flatMap((project) =>
      project.links
        .filter((link) => {
          try {
            return new URL(link.url).hostname === 'github.com';
          } catch {
            return false;
          }
        })
        .map((link) => ({
          name: link.url.split('/').filter(Boolean).slice(-1)[0],
          description: project.summary,
          url: link.url,
          language: null,
        })),
    )
    .slice(0, 4),
  languages: [],
  activity: [],
});

const fetchJson = async (url) => {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Mostakim-Adib-Portfolio',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`GitHub returned HTTP ${response.status}`);
  return response.json();
};

const getRemoteSnapshot = async () => {
  const [repositories, events] = await Promise.all([
    fetchJson(`https://api.github.com/users/${ACCOUNT}/repos?sort=updated&per_page=6`),
    fetchJson(`https://api.github.com/users/${ACCOUNT}/events/public?per_page=10`),
  ]);
  if (!Array.isArray(repositories) || !Array.isArray(events)) {
    throw new Error('GitHub returned an unexpected response');
  }

  const languages = [...new Set(repositories.map((repo) => repo.language).filter(Boolean))].slice(0, 8);
  const activity = events
    .filter((event) => event.public !== false && event.repo?.name)
    .map((event) => {
      const repository = event.repo.name.split('/').at(-1);
      if (event.type === 'PushEvent') return `Pushed changes to ${repository}`;
      if (event.type === 'IssuesEvent') return `Worked on an issue in ${repository}`;
      if (event.type === 'PullRequestEvent') return `Worked on a pull request in ${repository}`;
      if (event.type === 'CreateEvent') return `Created a branch or repository in ${repository}`;
      return `Public activity in ${repository}`;
    })
    .slice(0, 3);

  return {
    repositories: repositories
      .filter((repo) => !repo.fork && repo.html_url)
      .slice(0, 4)
      .map((repo) => ({
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
      })),
    languages,
    activity,
  };
};

export const getGithubSnapshot = async () => {
  if (cachedSnapshot && Date.now() - cachedAt < CACHE_TTL) return cachedSnapshot;
  if (refreshPromise) return refreshPromise;

  refreshPromise = getRemoteSnapshot()
    .then((snapshot) => {
      cachedSnapshot = snapshot;
      cachedAt = Date.now();
      return snapshot;
    })
    .catch((error) => {
      logger.warn('GitHub snapshot unavailable; using curated project links', { message: error.message });
      return cachedSnapshot ?? fallbackSnapshot();
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export default getGithubSnapshot;
