/**
 * Project details supplied by the portfolio owner. Avoid adding metrics or
 * implementation claims without confirming them against the shipped product.
 * Fields that are not part of the verified data (years, team sizes, metrics) are
 * intentionally omitted and must not be invented.
 */
export const projects = [
  {
    id: 'xyro-social',
    slug: 'xyrosocial',
    title: 'XyroSocial',
    alternateNames: ['XyroSpace', 'TruthSpace'],
    summary: 'A live social platform for sharing posts and messaging in real time.',
    description:
      'XyroSocial brings together a social feed, messaging and an assistant that replies to mentions. It runs across Vercel and Cloudflare Workers, with Firebase, D1, Cloudinary and MongoDB in its stack.',
    problem: 'Bring feed ranking, real-time conversations and an AI reply bot together in one social product.',
    role: 'Founder & solo full-stack developer',
    status: 'Live',
    featured: true,
    stack: [
      'React',
      'TypeScript',
      'Firebase Auth',
      'Firestore',
      'Firebase RTDB',
      'Cloudflare D1',
      'Cloudinary',
      'MongoDB',
      'Vercel',
      'Cloudflare Workers',
      'Gemini',
      'Groq',
    ],
    tags: ['React', 'TypeScript', 'Firebase', 'Realtime', 'LLM', 'Cloudflare'],
    decisions: [
      'Use Gemini to re-rank feed candidates before the feed is served.',
      'Keep Firebase RTDB for ephemeral messaging signals only, Cloudflare D1 as the persistent message store.',
      'Convert Express routers into standalone Vercel handlers.',
      'Apply per-route rate limiting.',
      'Harden Firestore and RTDB security rules.',
      'Have the TruthAI bot reply to @truthai mentions through Groq.',
    ],
    fixes: [
      'Separated ephemeral real-time messaging signals in Firebase RTDB from persistent messages in Cloudflare D1.',
      'Converted Express routers into standalone Vercel handlers while retaining the Cloudflare Workers deployment.',
      'Added per-route rate limiting and hardened Firestore and RTDB security rules.',
    ],
    architecture: [
      'React / TypeScript',
      'Vercel + Cloudflare Workers',
      'Firebase + D1 + MongoDB',
      'Cloudinary + Gemini + Groq',
    ],
    links: [
      { label: 'Open XyroSocial', url: 'https://xyro-space.vercel.app' },
      { label: 'Open Cloudflare deployment', url: 'https://social.xyrobase.workers.dev' },
      { label: 'GitHub profile', url: 'https://github.com/mostakimadibbd' },
    ],
  },
  {
    id: 'studyforge',
    slug: 'studyforge',
    title: 'StudyForge',
    summary: 'A live AI-powered study tool for generating quizzes and notes.',
    description:
      'StudyForge generates quizzes and notes, exports material to PDF and DOCX, and supports multi-provider authentication. Timed quizzes allow one attempt with a 45-second limit, anti-cheat measures and a global leaderboard.',
    problem: 'Create a study workflow that can generate practice material while enforcing quiz attempts and credit usage on the server.',
    role: 'Founder & solo full-stack developer',
    status: 'Live',
    featured: true,
    stack: [
      'Vercel',
      'OpenRouter',
      'Firebase Admin',
      'Upstash Redis',
      'IndexedDB',
      'PWA',
    ],
    tags: ['AI', 'PWA', 'Firebase', 'OpenRouter', 'Redis'],
    decisions: [
      'Route model requests through OpenRouter.',
      'Enforce credit usage with Firebase Admin transactions on the server.',
      'Use Upstash Redis sliding-window rate limits.',
      'Support offline sync with IndexedDB.',
      'Use one-attempt, 45-second quizzes with anti-cheat measures and a global leaderboard.',
    ],
    fixes: [
      'Enforced credit use on the server with Firebase Admin transactions.',
      'Applied Upstash Redis sliding-window rate limiting to provider-backed requests.',
      'Kept offline study changes in IndexedDB for sync.',
    ],
    architecture: [
      'StudyForge on Vercel',
      'Firebase Auth + Firebase Admin',
      'OpenRouter + Upstash Redis',
      'IndexedDB + PWA',
    ],
    links: [{ label: 'Open StudyForge', url: '' }], // TODO_CONTENT.md: add live StudyForge URL
  },
  {
    id: 'xyrobase',
    slug: 'xyrobase',
    title: 'XyroBase',
    summary: 'A company site and product home for the Xyro suite.',
    description:
      'XyroBase is built with Next.js App Router, TypeScript and Tailwind. It includes a command palette, a mega-menu, a blog and changelog, and a press kit.',
    problem: 'Give a growing suite of products a shared home for product information and updates.',
    role: 'Founder & solo full-stack developer',
    status: 'Live',
    featured: true,
    stack: [
      'Next.js App Router',
      'TypeScript',
      'Tailwind',
      'Framer Motion',
      'Command palette',
      'Mega-menu',
      'Blog and changelog',
      'Press kit',
    ],
    tags: ['Next.js', 'TypeScript', 'Tailwind', 'Framer Motion'],
    decisions: [
      'Use an App Router site to organise the product company public content.',
      'Use a command palette and mega-menu to keep navigation useful across the product suite.',
    ],
    fixes: [],
    architecture: ['Next.js App Router', '18 routes', 'TypeScript + Tailwind', 'Framer Motion + product content'],
    links: [{ label: 'XyroBrowse on GitHub', url: 'https://github.com/mostakimadibbd/XyroBrowse' }],
    products: [
      { name: 'XyroConnect', status: 'In development', description: 'Messaging product.' },
      { name: 'XyroBrowse', status: 'In development', description: 'Electron AI browser.', repo: 'https://github.com/mostakimadibbd/XyroBrowse' },
      { name: 'XyroDrive', status: 'Planned', description: '' },
    ],
  },
];

export default projects;
