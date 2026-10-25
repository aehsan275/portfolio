export const projects = [
  {
    id: 'raytracer',
    title: 'GPU Ray Tracer',
    subtitle: 'Light, computed.',
    description:
      'A ray tracer built from scratch, accelerated on the GPU. Neural denoising turns noisy samples into a clearer image.',
    tech: ['C++', 'CUDA', 'PyTorch'],
    category: 'Graphics / AI',
    detail:
      'Parallel ray generation, material sampling, and neural denoising bring graphics programming and machine learning into one rendering pipeline.',
  },
  {
    id: 'scrabble',
    title: 'Scrabble Solver',
    subtitle: 'Every move matters.',
    description:
      'A high-performance move generator that searches the board, scores possibilities, and finds the strongest play.',
    tech: ['Python', 'DAWG', 'Tkinter'],
    category: 'Algorithms',
    detail:
      'Trie/DAWG search, anchors, and cross-checks prune impossible moves before board scoring ranks the remaining candidates.',
  },
  {
    id: 'kinetics',
    title: 'MM Kinetics',
    subtitle: 'Uncertainty, understood.',
    description:
      'A statistical learning pipeline for Michaelis–Menten kinetics, from mechanistic simulation to calibrated predictions.',
    tech: ['Python', 'SciPy', 'scikit-learn'],
    category: 'Scientific ML',
    detail:
      'Constrained curve fitting, grouped validation, bootstrap uncertainty, and conformal prediction keep the analysis tied to the underlying science.',
  },
  {
    id: 'http',
    title: 'C++ HTTP Server',
    subtitle: 'Closer to the metal.',
    description:
      'An HTTP/1.1 server built from lower-level networking primitives, with persistent connections and a thread pool.',
    tech: ['C++', 'epoll', 'HTTP/1.1'],
    category: 'Systems',
    detail:
      'Sockets, routing, persistent connections, logging, and a thread pool handle each response.',
  },
  {
    id: 'rag',
    title: 'RAG Framework',
    subtitle: 'Context changes everything.',
    description:
      'An end-to-end retrieval augmented generation prototype that connects a question to the information behind an answer.',
    tech: ['Python', 'Gemini', 'ChromaDB'],
    category: 'AI / Retrieval',
    detail:
      'Embedding generation, vector retrieval, and grounded generation form an inspectable pipeline, with a Streamlit interface for experimentation.',
  },
] as const;
export type Project = (typeof projects)[number];
export const bio =
  'Software engineer and Computer Science student at the University of Waterloo. Interested in the space between intelligent systems and efficient computation.';
export const experience =
  'Software Engineering Intern at NexaQuanta — prototyping RAG systems and AI agents with Python and LangChain.';
