/**
 * Single source of truth for the portfolio owner's public profile.
 * Edit this file to update the site — no frontend changes required.
 */
export const profile = {
  name: 'Mostakim Adib',
  initials: 'MA',
  role: 'AI & ML Engineer',
  secondaryRole: 'Full-Stack Software Engineer',
  tagline: 'I build intelligent systems that ship.',
  summary:
    'Machine-learning engineer focused on taking models from notebook to production — reliable training pipelines, serving infrastructure, and the full-stack products that put them in front of real users.',
  location: 'Dhaka, Bangladesh',
  timezone: 'Asia/Dhaka (UTC+6)',
  availability: 'Open to ML engineering and full-stack roles',
  email: 'hello@mostakimadib.dev',
  phone: '+880 1XXX-XXXXXX',
  locationUrl: 'https://www.openstreetmap.org/search?query=Dhaka%2C%20Bangladesh',
  yearsExperience: 5,
  projectsShipped: 40,
  modelsInProduction: 12,
  papersAndTalks: 9,
  resumeUrl: '/assets/resume.pdf',

  socials: [
    { label: 'GitHub', handle: '@mostakimadib', url: 'https://github.com/mostakimadib', icon: 'github' },
    { label: 'LinkedIn', handle: 'in/mostakimadib', url: 'https://www.linkedin.com/in/mostakimadib', icon: 'linkedin' },
    { label: 'X', handle: '@mostakimadib', url: 'https://x.com/mostakimadib', icon: 'x' },
    { label: 'Email', handle: 'hello@mostakimadib.dev', url: 'mailto:hello@mostakimadib.dev', icon: 'mail' },
  ],

  focusAreas: [
    {
      title: 'Applied Machine Learning',
      description:
        'Supervised, unsupervised and deep learning systems for classification, ranking, forecasting and NLP.',
      icon: 'brain',
    },
    {
      title: 'MLOps & Production Inference',
      description:
        'Reproducible pipelines, experiment tracking, containerised serving and cost-aware model deployment.',
      icon: 'pipeline',
    },
    {
      title: 'Product Engineering',
      description:
        'Type-safe, accessible web applications with a real API, a real database and real observability.',
      icon: 'layers',
    },
  ],

  highlights: [
    {
      metric: '18%',
      label: 'Average inference latency reduction',
      detail: 'Through batching, quantisation and ONNX Runtime migration across production services.',
    },
    {
      metric: '94%',
      label: 'Model accuracy at 1/3 training cost',
      detail: 'Distillation and augmentation strategies applied to a large-scale document classifier.',
    },
    {
      metric: '2.1M',
      label: 'Requests served per day',
      detail: 'On a horizontally-scaled inference tier with p95 latency under 90 ms.',
    },
  ],

  currentlyLearning: [
    'Distributed training with PyTorch Lightning and Ray',
    'Rust for high-performance inference runtimes',
    'Retrieval-augmented generation architectures',
  ],
};

export default profile;
