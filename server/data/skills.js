/**
 * Skills explicitly supplied by the portfolio owner; grouped as tags with no
 * proficiency ratings. Add anything missing only after confirming it with the owner.
 */
export const skills = [
  {
    id: 'frontend',
    title: 'Frontend',
    items: ['React', 'TypeScript', 'Next.js', 'Vite', 'Tailwind', 'Framer Motion'],
  },
  {
    id: 'backend',
    title: 'Backend & data',
    items: ['Node / Express', 'Firebase', 'Cloudflare Workers / D1 / R2', 'MongoDB'],
  },
  {
    id: 'platform',
    title: 'Shipping & infrastructure',
    items: ['Vercel', 'Cloudinary', 'Upstash Redis', 'Electron', 'PWA'],
  },
  {
    id: 'integrations',
    title: 'AI, security & operations',
    items: [
      'LLM API integration (Gemini, Groq, OpenRouter)',
      'Rate limiting',
      'Security hardening',
    ],
  },
];

export default skills;
