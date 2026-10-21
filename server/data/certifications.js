/**
 * Education, certifications and speaking engagements.
 */
export const certifications = [
  {
    id: 'cert_01',
    title: 'Machine Learning Engineering for Production (MLOps)',
    issuer: 'DeepLearning.AI',
    year: 2024,
    credential: 'Certificate earned',
  },
  {
    id: 'cert_02',
    title: 'AWS Certified Machine Learning — Specialty',
    issuer: 'Amazon Web Services',
    year: 2023,
    credential: 'Valid through 2026',
  },
  {
    id: 'cert_03',
    title: 'Professional Data Engineering with Python',
    issuer: 'DataCamp',
    year: 2023,
    credential: 'Certificate earned',
  },
  {
    id: 'cert_04',
    title: 'Google Cloud Professional ML Engineer',
    issuer: 'Google Cloud',
    year: 2022,
    credential: 'Valid through 2025',
  },
  {
    id: 'cert_05',
    title: 'TensorFlow Developer Certification',
    issuer: 'Google',
    year: 2022,
    credential: 'Certificate earned',
  },
];

export const education = [
  {
    id: 'edu_01',
    degree: 'B.Sc. in Computer Science & Engineering',
    institution: 'University of Dhaka',
    location: 'Dhaka, Bangladesh',
    start: 2016,
    end: 2020,
    detail:
      'Focus on artificial intelligence, machine learning and distributed systems. Final-year project on weakly-supervised image segmentation.',
  },
];

export const speaking = [
  {
    id: 'talk_01',
    title: 'From Notebook to Production: An Honest MLOps Playbook',
    event: 'AI Engineer Summit',
    date: '2025-06',
    type: 'Conference talk',
  },
  {
    id: 'talk_02',
    title: 'Grounding LLMs: Building a RAG System That Actually Holds Up',
    event: 'PyData Dhaka',
    date: '2024-11',
    type: 'Technical talk',
  },
  {
    id: 'talk_03',
    title: 'Shipping Models on the Edge',
    event: 'Robotics & Vision Meetup',
    date: '2023-09',
    type: 'Meetup talk',
  },
];

export default { certifications, education, speaking };
