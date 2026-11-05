import { projects, thoughts } from './data';

export const siteUrl = 'https://abdullahehsan.vercel.app';
export const pagePaths = [
  '/',
  '/experience',
  '/projects',
  '/thoughts',
  ...projects.map((project) => `/projects/${project.id}`),
  ...thoughts.map((post) => `/thoughts/${post.id}`),
];

export function pageMetadata(path: string) {
  const detail = [...projects, ...thoughts].find(
    (item) => path === `/projects/${item.id}` || path === `/thoughts/${item.id}`,
  );
  const pages: Record<string, { title: string; description: string }> = {
    '/': {
      title: 'abdullah ehsan',
      description:
        'abdullah ehsan. cs @ uwaterloo. looking for summer 2027 internships. mm kinetics and scrabble solver.',
    },
    '/experience': {
      title: 'experience · abdullah ehsan',
      description: 'experience and education · abdullah ehsan',
    },
    '/projects': {
      title: 'projects · abdullah ehsan',
      description: 'things i’ve built · abdullah ehsan',
    },
    '/thoughts': { title: 'thoughts · abdullah ehsan', description: 'thoughts · abdullah ehsan' },
  };
  const page = detail
    ? { title: `${detail.title} · abdullah ehsan`, description: detail.summary }
    : (pages[path] ?? { title: 'page not found · abdullah ehsan', description: 'page not found.' });
  return { ...page, url: `${siteUrl}${path === '/' ? '/' : path}` };
}
