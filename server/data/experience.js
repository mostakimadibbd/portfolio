/**
 * Professional experience timeline.
 */
export const experience = [
  {
    id: 'exp_01',
    role: 'Senior Machine Learning Engineer',
    company: 'Nimbus AI',
    location: 'Remote / Dhaka',
    employmentType: 'Full-time',
    start: '2024-03',
    end: 'Present',
    summary:
      'Lead the applied ML team behind a document-intelligence and assistant product suite serving enterprise customers.',
    achievements: [
      'Owned the modelling roadmap for 12 production models, improving extraction F1 from 0.88 to 0.94.',
      'Designed the training and release pipeline now used by every ML team in the company.',
      'Mentored four engineers, two of whom were promoted within twelve months.',
      'Cut cloud inference spend 34 % through quantisation, batching and autoscaling policy.',
    ],
    stack: ['PyTorch', 'Python', 'FastAPI', 'Kubernetes', 'AWS', 'PostgreSQL'],
  },
  {
    id: 'exp_02',
    role: 'Machine Learning Engineer',
    company: 'Corelytics',
    location: 'Dhaka, Bangladesh',
    employmentType: 'Full-time',
    start: '2022-06',
    end: '2024-02',
    summary:
      'Built forecasting and recommendation systems for retail and logistics customers in a fast-moving product team.',
    achievements: [
      'Shipped a hierarchical forecasting toolkit that improved forecast WAPE by 21 %.',
      'Built a hybrid recommender that lifted click-through rate by 23 % in live A/B tests.',
      'Introduced model monitoring and alerting, reducing incident detection time to under 15 minutes.',
      'Created the internal MLOps starter kit now used across three product teams.',
    ],
    stack: ['Python', 'XGBoost', 'Airflow', 'Redis', 'React', 'GCP'],
  },
  {
    id: 'exp_03',
    role: 'Full-Stack Software Engineer',
    company: 'Riverbed Systems',
    location: 'Dhaka, Bangladesh',
    employmentType: 'Full-time',
    start: '2021-01',
    end: '2022-05',
    summary:
      'Delivered customer-facing web platforms and internal tooling for fintech and logistics clients.',
    achievements: [
      'Developed a multi-tenant accounting platform handling $40M+ in payout volume.',
      'Introduced automated testing that raised coverage from 18 % to 81 %.',
      'Rebuilt the operations dashboard with streaming updates, cutting support tickets by 27 %.',
      'Set up CI/CD pipelines that reduced release time from days to under an hour.',
    ],
    stack: ['TypeScript', 'Node.js', 'React', 'PostgreSQL', 'GraphQL', 'AWS'],
  },
  {
    id: 'exp_04',
    role: 'Software Engineering Intern',
    company: 'Bitfold Labs',
    location: 'Dhaka, Bangladesh',
    employmentType: 'Internship',
    start: '2020-06',
    end: '2020-12',
    summary:
      'Built internal automation tooling and prototypes for early-stage product teams.',
    achievements: [
      'Automated a manual reporting workflow, saving roughly 12 hours per week.',
      'Prototyped a prototype-quality image search service used in a customer pilot.',
      'Wrote onboarding documentation and developer setup guides for new engineers.',
    ],
    stack: ['Python', 'Node.js', 'Docker', 'MongoDB'],
  },
];

export default experience;
