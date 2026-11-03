import { Fragment, useEffect, useRef, useState, type MouseEvent } from 'react';
import { education, experience, profile, projects, thoughts } from './data';
import { DotBackground } from './components/DotBackground';
import { FloralBorder } from './components/FloralBorder';
import { useTheme } from './useTheme';
import './styles/daisy.css';
import './styles.css';

function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return reduced;
}

function Name({ reduced, initialHome }: { reduced: boolean; initialHome: boolean }) {
  return (
    <h1
      className="name"
      tabIndex={-1}
      aria-label="Abdullah Ehsan"
      data-reduced={reduced}
      data-initial-home={initialHome}
    >
      <span className="name-english" aria-hidden="true">
        abdullah<span className="name-dot">.</span>
      </span>
      <span className="name-urdu" lang="ur" dir="rtl" aria-hidden="true">
        عبداللہ
      </span>
    </h1>
  );
}

function ContactLinks() {
  return (
    <nav className="contact-links" aria-label="Contact">
      <span className="contact-email">
        <a className="d-link" href={profile.email}>
          {profile.email.slice('mailto:'.length).replace('@', ' [at] ').replaceAll('.', ' [dot] ')}
        </a>
      </span>
      <a className="d-link" href={profile.github}>
        github
      </a>
      <a className="d-link" href={profile.linkedin}>
        linkedin
      </a>
      <a className="d-link" href={profile.x}>
        x
      </a>
      <a className="d-link" href={profile.calendar}>
        cal
      </a>
    </nav>
  );
}

function CsWebring() {
  const ring = 'https://cs.uwatering.com/#abdullahehsan.vercel.app';
  return (
    <nav className="cs-webring" aria-label="Waterloo CS webring">
      <a href={`${ring}?nav=prev`} aria-label="Previous site in the Waterloo CS webring">←</a>
      <a href={ring} className="cs-webring-mark" aria-label="Waterloo CS webring">
        <span aria-hidden="true" />
      </a>
      <a href={`${ring}?nav=next`} aria-label="Next site in the Waterloo CS webring">→</a>
    </nav>
  );
}

function BackToTop({ pageKey, reduced }: { pageKey: string; reduced: boolean }) {
  const [scrollable, setScrollable] = useState(false);
  const slot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (!active) return;
      // Exclude the control's own space so it cannot create its own scrollbar.
      const controlHeight = slot.current?.offsetHeight ?? 0;
      const root = document.documentElement;
      setScrollable(root.scrollHeight - controlHeight > root.clientHeight + 1);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    observer.observe(document.documentElement);
    window.addEventListener('resize', schedule);
    window.visualViewport?.addEventListener('resize', schedule);
    document.fonts.ready.then(() => {
      if (active) schedule();
    });
    schedule();
    return () => {
      active = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('resize', schedule);
      window.visualViewport?.removeEventListener('resize', schedule);
    };
  }, [pageKey]);
  return (
    <div ref={slot} className="back-to-top-slot" hidden={!scrollable}>
      <button
        className="d-btn d-btn-link back-to-top"
        type="button"
        onClick={() => {
          window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
          document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
        }}
      >
        back to top ↑
      </button>
    </div>
  );
}

function OrganizationMark({ name }: { name: 'waterloo' | 'nexaquanta' | 'ucalgary' }) {
  return <span className={`organization-mark organization-mark--${name}`} aria-hidden="true" />;
}

function Home({ reduced, initialHome }: { reduced: boolean; initialHome: boolean }) {
  return (
    <>
      <main id="main" tabIndex={-1}>
        <div className="home">
          <div className="home-composition">
            <section className="intro" data-reading aria-label="About Abdullah">
              <Name reduced={reduced} initialHome={initialHome} />
              <p className="intro-bio">{profile.introduction}</p>
            </section>
            <div className="summary" data-reading>
              <section className="summary-group" aria-labelledby="studying">
                <h2 className="group-label" id="studying">
                  studying
                </h2>
                <p className="study-line">
                  cs @{' '}
                  <a
                    className="d-link summary-link organization-name"
                    href="/experience#education"
                  >
                    <OrganizationMark name="waterloo" />
                    uwaterloo.
                  </a>
                </p>
              </section>
              <section className="summary-group" aria-labelledby="building">
                <h2 className="group-label" id="building">
                  previously
                </h2>
                <p className="study-line">
                  swe @{' '}
                  <a
                    className="d-link summary-link organization-name"
                    href="/experience#experience"
                  >
                    <OrganizationMark name="nexaquanta" />
                    nexaquanta
                  </a>
                </p>
                <p className="summary-copy">worked on agents and rag systems.</p>
              </section>
              <section className="summary-group" aria-labelledby="overview-projects">
                <h2 className="group-label" id="overview-projects">
                  projects
                </h2>
                <ul className="home-projects">
                  {projects.slice(0, 2).map((project) => (
                    <li key={project.id}>
                      <a className="d-link summary-link" href={`/projects/${project.id}`}>
                        {project.title}
                      </a>
                      <span>{project.summary}</span>
                    </li>
                  ))}
                </ul>
                <a className="d-link more-projects" href="/projects">
                  more projects
                </a>
              </section>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const PAGES = [
  { path: '/', label: 'about' },
  { path: '/experience', label: 'experience' },
  { path: '/projects', label: 'projects' },
  { path: '/thoughts', label: 'thoughts' },
];

function getDetail(path: string) {
  const project = projects.find((item) => path === '/projects/' + item.id);
  if (project) return { ...project, parent: '/projects', parentLabel: 'projects' };
  const post = thoughts.find((item) => path === '/thoughts/' + item.id);
  if (post) return { ...post, parent: '/thoughts', parentLabel: 'thoughts' };
  return null;
}

type WriteupSection = {
  title: string;
  id?: string;
  label?: string;
  paragraphs: readonly string[];
  equations?: readonly { expression: string; note: string; afterParagraph?: number }[];
  image?: string;
  imageAlt?: string;
  imageKind?: string;
  caption?: string;
  afterImage?: readonly string[];
  secondImage?: string;
  secondImageAlt?: string;
  secondCaption?: string;
};

function ProjectWriteup({
  subtitle,
  sections,
}: {
  subtitle: string;
  sections: readonly WriteupSection[];
}) {
  const sectionIds = ['reaction', 'fitting', 'ml-workflow', 'results', 'bugs'];
  const sectionLabels = ['reaction', 'fitting', 'ml', 'results', 'bugs'];
  const dialog = useRef<HTMLDialogElement>(null);
  const [viewedImage, setViewedImage] = useState<{
    src: string;
    alt: string;
    screenshot: boolean;
  } | null>(null);
  useEffect(() => {
    if (viewedImage && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [viewedImage]);
  const openImage = (src: string, alt: string, screenshot = false) => {
    setViewedImage({ src, alt, screenshot });
  };
  return (
    <div className="project-writeup">
      {subtitle && <p className="writeup-subtitle">{subtitle}</p>}
      <nav className="writeup-nav" aria-label="On this page">
        {sections.map((section, index) => (
          <a className="d-link" key={section.title} href={`#${section.id ?? sectionIds[index]}`}>
            {section.label ?? sectionLabels[index]}
          </a>
        ))}
      </nav>
      {sections.map((section, index) => (
        <section className="writeup-section" key={section.title}>
          <h2 id={section.id ?? sectionIds[index]} tabIndex={-1}>
            {section.title}
          </h2>
          {section.paragraphs.map((paragraph, index) => {
            const equations = section.equations?.filter(
              (equation) => equation.afterParagraph === index + 1,
            );
            return (
              <Fragment key={paragraph}>
                <p>{paragraph}</p>
                {equations?.length ? (
                  <div className="equation-block" aria-label="equations">
                    {equations.map((equation) => (
                      <div className="equation-row" key={equation.expression}>
                        <span className="equation-expression">{equation.expression}</span>
                        <span className="equation-note">{equation.note}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </Fragment>
            );
          })}
          {section.image && (
            <figure>
              <button
                type="button"
                className="screenshot-link"
                aria-label={`enlarge ${section.imageKind === 'screenshot' ? 'scrabble solver screenshot' : section.title + ' chart'}`}
                onClick={() =>
                  openImage(
                    section.image!,
                    section.imageAlt ?? '',
                    section.imageKind === 'screenshot',
                  )
                }
              >
                <img
                  src={section.image}
                  alt={section.imageAlt ?? ''}
                  className={section.imageKind === 'screenshot' ? 'writeup-screenshot' : undefined}
                />
              </button>
              {section.caption && <figcaption>{section.caption}</figcaption>}
            </figure>
          )}
          {section.afterImage?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          {section.secondImage && (
            <figure>
              <button
                type="button"
                className="screenshot-link"
                aria-label="enlarge bootstrap distributions and parameter correlation chart"
                onClick={() => openImage(section.secondImage!, section.secondImageAlt ?? '')}
              >
                <img src={section.secondImage} alt={section.secondImageAlt ?? ''} />
              </button>
              {section.secondCaption && <figcaption>{section.secondCaption}</figcaption>}
            </figure>
          )}
        </section>
      ))}
      <dialog
        ref={dialog}
        className="image-viewer"
        aria-label="Enlarged image"
        onClose={() => setViewedImage(null)}
      >
        <div className="image-viewer-toolbar">
          <button
            type="button"
            className="image-viewer-close"
            aria-label="close image viewer"
            onClick={() => dialog.current?.close()}
            autoFocus
          >
            ×
          </button>
        </div>
        {viewedImage && (
          <div className="image-viewer-content">
            <img
              src={viewedImage.src}
              alt={viewedImage.alt}
              className={viewedImage.screenshot ? 'writeup-screenshot' : undefined}
            />
          </div>
        )}
      </dialog>
    </div>
  );
}

function PageContent({
  path,
  reduced,
  initialHome,
}: {
  path: string;
  reduced: boolean;
  initialHome: boolean;
}) {
  if (path === '/') return <Home reduced={reduced} initialHome={initialHome} />;
  const detail = getDetail(path);
  if (detail)
    return (
      <main id="main" className="inner-page portfolio-details detail-entry" tabIndex={-1}>
        <a className="d-link detail-back" href={detail.parent}>
          ← back to {detail.parentLabel}
        </a>
        <h1 data-reading tabIndex={-1}>
          {detail.title}
          {'repository' in detail && detail.repository && (
            <a className="d-link detail-source" href={detail.repository}>
              github ↗
            </a>
          )}
        </h1>
        <div className="detail-content" data-reading>
          {'writeup' in detail && detail.writeup ? (
            <ProjectWriteup {...detail.writeup} />
          ) : (
            detail.details.map((paragraph, index) =>
              paragraph.startsWith('### ') ? (
                <h2 key={index}>{paragraph.slice(4)}</h2>
              ) : (
                <p key={index}>
                  {paragraph.startsWith('**') && paragraph.endsWith('**') ? (
                    <strong>{paragraph.slice(2, -2)}</strong>
                  ) : (
                    paragraph
                  )}
                </p>
              ),
            )
          )}
        </div>
      </main>
    );
  return (
    <main id="main" className="inner-page portfolio-details" tabIndex={-1}>
      {path === '/experience' ? (
        <>
          <h1 data-reading tabIndex={-1}>
            experience.
          </h1>
          <section className="reading-section" data-reading aria-labelledby="experience">
            <h2 id="experience" tabIndex={-1}>
              experience.
            </h2>
            <h3 className="organization-name">
              <a className="d-link" href="https://nexaquanta.ai/">
                <OrganizationMark name="nexaquanta" />
                {experience.company}
              </a>
            </h3>
            <p>{experience.summary}</p>
            <dl className="experience-roles">
              {experience.roles.map((role) => (
                <div key={role.dates}>
                  <dt className="entry-title">{role.title}</dt>
                  <dd className="role-dates">{role.dates}</dd>
                  <dd className="role-description">{role.description}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="reading-section" data-reading aria-labelledby="education">
            <h2 className="section-label" id="education" tabIndex={-1}>
              education.
            </h2>
            <div className="education-entry">
              <div className="education-heading">
                <h3 className="organization-name">
                  <a className="d-link" href="https://uwaterloo.ca/">
                    <OrganizationMark name="waterloo" />
                    {education.institution}
                  </a>
                </h3>
                <span>{education.dates}</span>
              </div>
              <p className="entry-title">{education.program}</p>
              <p>{education.reflection}</p>
            </div>
            <div className="education-entry">
              <div className="education-heading">
                <h3 className="organization-name">
                  <a className="d-link" href="https://www.ucalgary.ca/">
                    <OrganizationMark name="ucalgary" />
                    {education.priorCourse.institution}
                  </a>
                </h3>
                <span>{education.priorCourse.dates}</span>
              </div>
              <p className="entry-title">{education.priorCourse.program}</p>
              <p>{education.priorCourse.reflection}</p>
            </div>
          </section>
        </>
      ) : path === '/projects' ? (
        <>
          <section className="projects-section" aria-labelledby="projects">
            <h1 id="projects" data-reading tabIndex={-1}>
              things i’ve built.
            </h1>
            {projects.map((project) => (
              <article
                className="reading-section project-entry"
                data-reading
                key={project.id}
                aria-labelledby={`project-${project.id}`}
              >
                <h2 id={`project-${project.id}`} tabIndex={-1}>
                  <a className="d-link" href={`/projects/${project.id}`}>
                    {project.title}
                  </a>
                </h2>
                <p>{project.description}</p>
                <p className="technologies">{project.tech.join(' / ')}</p>
                {project.repository && (
                  <a
                    className="d-link project-source"
                    href={project.repository}
                    aria-label={`${project.title} on github`}
                  >
                    github ↗
                  </a>
                )}
                {project.note && <p className="project-note">{project.note}</p>}
              </article>
            ))}
          </section>
        </>
      ) : path === '/thoughts' ? (
        <>
          <h1 data-reading tabIndex={-1}>
            thoughts.
          </h1>
          {thoughts.map((post) => (
            <article
              className="reading-section thought-entry"
              data-reading
              key={post.id}
              aria-labelledby={post.id}
            >
              <h2 id={post.id} tabIndex={-1}>
                <a className="d-link" href={`/thoughts/${post.id}`}>
                  {post.title}
                </a>
              </h2>
              <p>{post.summary}</p>
            </article>
          ))}
        </>
      ) : (
        <>
          <h1 data-reading tabIndex={-1}>
            page not found.
          </h1>
          <p>there isn’t a page at this address.</p>
          <a className="d-link" href="/">
            return to the homepage
          </a>
        </>
      )}
    </main>
  );
}

type Location = { path: string; hash: string; search: string };
function readLocation(): Location {
  const url = new URL(window.location.href);
  let path = url.pathname.replace(/\/+$/, '') || '/';
  const legacy: Record<string, string> = {
    '/about': '/',
    '/what-ive-done': '/experience',
    '/education': '/experience#education',
    '/projects/kinetics': '/projects/mm-kinetics',
    '/projects/scrabble': '/projects/scrabble-solver',
    '/projects/flashcards': '/projects',
    '/projects/flashcards-app': '/projects',
    '/thoughts/2am-thoughts-before-a-midterm': '/thoughts/why-success-feels-average',
    '/projects/raytracer': '/projects',
    '/projects/http': '/projects',
    '/projects/rag': '/projects',
  };
  const oldFragments: Record<string, string> = {
    '#project-kinetics': '/projects/mm-kinetics',
    '#project-scrabble': '/projects/scrabble-solver',
    '#project-flashcards': '/projects',
    '#project-flashcards-app': '/projects',
    '#2am-thoughts-before-a-midterm': '/thoughts/why-success-feels-average',
  };
  let destination = legacy[path];
  if ((path === '/' || path === '/projects' || path === '/thoughts') && oldFragments[url.hash])
    destination = oldFragments[url.hash];
  if (path === '/') {
    if (['#experience', '#education'].includes(url.hash)) destination = '/experience' + url.hash;
    else if (url.hash === '#projects') destination = '/projects';
    else if (projects.some((p) => url.hash === '#project-' + p.id))
      destination = '/projects/' + url.hash.slice('#project-'.length);
    else if (['#project-raytracer', '#project-http', '#project-rag'].includes(url.hash))
      destination = '/projects';
  }
  if (path === '/projects' && projects.some((p) => url.hash === '#project-' + p.id))
    destination = '/projects/' + url.hash.slice('#project-'.length);
  if (path === '/thoughts' && thoughts.some((p) => url.hash === '#' + p.id))
    destination = '/thoughts/' + url.hash.slice(1);
  if (destination) {
    const target = new URL(destination, url);
    path = target.pathname;
    url.hash = target.hash;
  }
  url.pathname = path;
  const canonical = path + url.search + url.hash;
  if (canonical !== window.location.pathname + window.location.search + window.location.hash)
    history.replaceState(history.state, '', canonical);
  return { path, hash: url.hash, search: url.search };
}

export default function App() {
  const { theme, chooseTheme } = useTheme();
  const [route, setRoute] = useState(readLocation);
  const initialHome = useRef(route.path === '/');
  const reduced = useReducedMotion();
  const intent = useRef<'load' | 'push' | 'pop' | 'hash'>('load');
  const previousPath = useRef(route.path);
  useEffect(() => {
    const pop = () => {
      intent.current = 'pop';
      setRoute(readLocation());
    };
    const hash = () => {
      if (intent.current !== 'pop') intent.current = 'hash';
      setRoute(readLocation());
    };
    window.addEventListener('popstate', pop);
    window.addEventListener('hashchange', hash);
    return () => {
      window.removeEventListener('popstate', pop);
      window.removeEventListener('hashchange', hash);
    };
  }, []);
  useEffect(() => {
    if (route.path !== '/') initialHome.current = false;
    const mode = intent.current,
      changedPage = previousPath.current !== route.path;
    intent.current = 'load';
    previousPath.current = route.path;
    document.title = 'abdullah ehsan';
    if (mode === 'hash' && !changedPage) return;
    let active = true;
    document.fonts.ready.then(() => {
      if (!active) return;
      let target: HTMLElement | null = null;
      try {
        target = route.hash
          ? document.getElementById(decodeURIComponent(route.hash.slice(1)))
          : null;
      } catch {}
      if (target) {
        if (mode !== 'pop')
          target.scrollIntoView({
            behavior: mode === 'push' && !reduced ? 'smooth' : 'instant',
            block: 'start',
          });
        target.focus({ preventScroll: true });
      } else if (mode === 'push' || changedPage) {
        if (mode !== 'pop') window.scrollTo({ top: 0, behavior: 'instant' });
        document.querySelector<HTMLElement>('main h1')?.focus({ preventScroll: true });
      }
    });
    return () => {
      active = false;
    };
  }, [route.path, route.hash]);
  const navigate = (event: MouseEvent<HTMLDivElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
    if (!anchor || anchor.target || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, window.location.href);
    if (
      url.origin !== window.location.origin ||
      !['http:', 'https:'].includes(url.protocol) ||
      url.pathname === '/resume.pdf'
    )
      return;
    // Native same-page fragments retain their browser focus and scroll behavior.
    if (url.pathname === window.location.pathname && url.hash) return;
    event.preventDefault();
    const destination = url.pathname + url.search + url.hash;
    if (destination === window.location.pathname + window.location.search + window.location.hash)
      return;
    history.pushState(null, '', destination);
    intent.current = 'push';
    setRoute(readLocation());
  };
  return (
    <div id="top" tabIndex={-1} className="portfolio" data-theme={theme} onClick={navigate}>
      <a className="skip-link d-link" href="#main">
        skip to content
      </a>
      <DotBackground reduced={reduced} pageKey={route.path} theme={theme} />
      <FloralBorder />
      <div className="site-shell">
        <header className="site-header" data-reading>
          <nav className="page-navigation" aria-label="main navigation">
            {PAGES.map((page) => (
              <a
                key={page.path}
                className="d-link"
                href={page.path}
                aria-current={
                  route.path === page.path
                    ? 'page'
                    : getDetail(route.path)?.parent === page.path
                      ? 'location'
                      : undefined
                }
              >
                {page.label}
              </a>
            ))}
          </nav>
          <div className="theme-control" role="group" aria-label="Color theme">
            <button
              className="d-btn d-btn-link"
              type="button"
              aria-pressed={theme === 'paper'}
              onClick={() => chooseTheme('paper')}
            >
              light
            </button>
            <span aria-hidden="true">/</span>
            <button
              className="d-btn d-btn-link"
              type="button"
              aria-pressed={theme === 'charcoal'}
              onClick={() => chooseTheme('charcoal')}
            >
              dark
            </button>
          </div>
        </header>
        <PageContent path={route.path} reduced={reduced} initialHome={initialHome.current} />
        <footer className="site-footer" data-reading>
          <p className="footer-name">abdullah ehsan</p>
          <CsWebring />
          <ContactLinks />

          <BackToTop key={route.path} pageKey={route.path} reduced={reduced} />
        </footer>
      </div>
    </div>
  );
}
