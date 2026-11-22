import { profile, projects, thoughts } from './data';

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
      title: 'Abdullah Ehsan | Computer Science at University of Waterloo',
      description:
        'Abdullah Ehsan studies computer science at the University of Waterloo. Explore his software projects, work on AI agents and retrieval systems, and personal essays.',
    },
    '/experience': {
      title: 'Experience & Education | Abdullah Ehsan',
      description:
        'Abdullah Ehsan’s software engineering internships at NexaQuanta, work on AI agents and RAG systems, and computer science studies at the University of Waterloo.',
    },
    '/projects': {
      title: 'Software Projects | Abdullah Ehsan',
      description:
        'Software projects by Abdullah Ehsan: MM Kinetics for enzyme reaction modelling and uncertainty estimation, and a Scrabble solver that ranks legal moves.',
    },
    '/thoughts': {
      title: 'Thoughts & Writing | Abdullah Ehsan',
      description:
        'Essays by Abdullah Ehsan on success, learning, and identity. Personal reflections from a University of Waterloo computer science student.',
    },
  };
  const page = detail
    ? {
        title: `${detail.title} | Abdullah Ehsan`,
        description: `${detail.summary} ${path.startsWith('/projects/') ? 'A software project' : 'An essay'} by Abdullah Ehsan, University of Waterloo computer science student.`,
      }
    : (pages[path] ?? { title: 'page not found · abdullah ehsan', description: 'page not found.' });
  return { ...page, url: `${siteUrl}${path === '/' ? '/' : path}` };
}

// One identity connects the portfolio, its author, and the public profiles already linked on site.
export function pageStructuredData(path: string) {
  if (!pagePaths.includes(path)) return null;
  const metadata = pageMetadata(path);
  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;
  const post = thoughts.find((item) => path === `/thoughts/${item.id}`);
  const section = path.startsWith('/projects')
    ? 'projects'
    : path.startsWith('/thoughts')
      ? 'thoughts'
      : 'experience';
  const breadcrumbs =
    path === '/'
      ? []
      : [
          { '@type': 'ListItem', position: 1, name: profile.name, item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: section, item: `${siteUrl}/${section}` },
          ...(path.split('/').length > 2
            ? [
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: metadata.title.split(' | ')[0],
                  item: metadata.url,
                },
              ]
            : []),
        ];
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: profile.name,
        givenName: 'Abdullah',
        familyName: 'Ehsan',
        alternateName: ['Abdullah', 'عبداللہ'],
        url: `${siteUrl}/`,
        description:
          'Computer science student at the University of Waterloo with software engineering internship experience at NexaQuanta.',
        affiliation: {
          '@type': 'CollegeOrUniversity',
          name: 'University of Waterloo',
          url: 'https://uwaterloo.ca/',
        },
        sameAs: [profile.github, profile.linkedin, profile.x],
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: profile.name,
        url: `${siteUrl}/`,
        inLanguage: 'en',
        publisher: { '@id': personId },
      },
      {
        '@type':
          path === '/'
            ? 'ProfilePage'
            : ['/projects', '/thoughts'].includes(path)
              ? 'CollectionPage'
              : 'WebPage',
        '@id': `${metadata.url}#webpage`,
        url: metadata.url,
        name: metadata.title,
        description: metadata.description,
        inLanguage: 'en',
        isPartOf: { '@id': websiteId },
        ...(path === '/'
          ? { mainEntity: { '@id': personId } }
          : { about: { '@id': personId }, breadcrumb: { '@id': `${metadata.url}#breadcrumb` } }),
      },
      ...(breadcrumbs.length
        ? [
            {
              '@type': 'BreadcrumbList',
              '@id': `${metadata.url}#breadcrumb`,
              itemListElement: breadcrumbs,
            },
          ]
        : []),
      ...(post
        ? [
            {
              '@type': 'BlogPosting',
              '@id': `${metadata.url}#article`,
              headline: post.title,
              description: post.summary,
              url: metadata.url,
              author: { '@id': personId },
              mainEntityOfPage: { '@id': `${metadata.url}#webpage` },
              inLanguage: 'en',
            },
          ]
        : []),
    ],
  };
}
