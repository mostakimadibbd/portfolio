/**
 * Skill inventory grouped by domain, with proficiency expressed as a percentage
 * that the frontend renders as an accessible progress meter.
 */
export const skills = [
  {
    id: 'ml',
    title: 'Machine Learning & AI',
    icon: 'brain',
    summary: 'Modelling, evaluation and deployment of production ML systems.',
    items: [
      { name: 'PyTorch', level: 92, note: 'Fine-tuning, distillation, custom training loops' },
      { name: 'TensorFlow / Keras', level: 85, note: 'Production serving and TFLite export' },
      { name: 'scikit-learn', level: 94, note: 'Classical baselines, pipelines, evaluation' },
      { name: 'Hugging Face', level: 88, note: 'Transformers, tokenizers, fine-tuning' },
      { name: 'NLP & RAG', level: 86, note: 'Embeddings, reranking, retrieval pipelines' },
      { name: 'Computer Vision', level: 80, note: 'Detection, segmentation, ONNX export' },
      { name: 'LLM Engineering', level: 84, note: 'Tool use, evaluation harnesses, guardrails' },
    ],
  },
  {
    id: 'data',
    title: 'Data & MLOps',
    icon: 'pipeline',
    summary: 'Reliable, reproducible data and model lifecycles.',
    items: [
      { name: 'pandas / Polars', level: 93, note: 'Large-scale transformations and ETL' },
      { name: 'SQL', level: 89, note: 'Window functions, tuning, query planning' },
      { name: 'Airflow / Prefect', level: 82, note: 'Orchestration, backfills, scheduling' },
      { name: 'MLflow / Weights & Biases', level: 78, note: 'Tracking, model registry, lineage' },
      { name: 'Docker', level: 90, note: 'Multi-stage, slim runtime images' },
      { name: 'Kubernetes', level: 76, note: 'Deployments, autoscaling, jobs' },
      { name: 'Feature Engineering', level: 87, note: 'Encoders, embeddings, drift-aware features' },
    ],
  },
  {
    id: 'backend',
    title: 'Backend Engineering',
    icon: 'server',
    summary: 'APIs, services and data infrastructure that hold up under load.',
    items: [
      { name: 'Python / FastAPI', level: 92, note: 'Async services, typed contracts' },
      { name: 'Node.js / Express', level: 88, note: 'REST and streaming APIs' },
      { name: 'PostgreSQL', level: 86, note: 'Schema design, indexing, partitioning' },
      { name: 'Redis', level: 84, note: 'Caching, rate limiting, queues' },
      { name: 'Kafka / RabbitMQ', level: 74, note: 'Event streaming, outbox pattern' },
      { name: 'GraphQL', level: 76, note: 'Schema design, resolver optimisation' },
      { name: 'Go', level: 70, note: 'Concurrent services and CLIs' },
    ],
  },
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    icon: 'layout',
    summary: 'Fast, accessible interfaces with attention to detail.',
    items: [
      { name: 'TypeScript', level: 89, note: 'Strict types, generics, safe refactors' },
      { name: 'React / Next.js', level: 87, note: 'SSR, streaming, route-level splitting' },
      { name: 'Vue 3', level: 78, note: 'Composition API and reactive design' },
      { name: 'Tailwind CSS', level: 85, note: 'Design systems and responsive layouts' },
      { name: 'Accessibility (WCAG)', level: 80, note: 'Keyboard, ARIA, contrast auditing' },
      { name: 'Web Performance', level: 86, note: 'Core Web Vitals, budgets, caching' },
    ],
  },
  {
    id: 'tooling',
    title: 'Tooling & Practices',
    icon: 'wrench',
    summary: 'The practices that keep delivery fast and dependable.',
    items: [
      { name: 'Git / GitHub Actions', level: 92, note: 'Trunk-based development, reusable workflows' },
      { name: 'Pytest / Vitest', level: 88, note: 'Unit, integration and contract testing' },
      { name: 'Jest / Testing Library', level: 84, note: 'Behaviour-driven UI testing' },
      { name: 'CI/CD Pipelines', level: 87, note: 'Automated build, test and release gates' },
      { name: 'Observability', level: 80, note: 'OpenTelemetry, structured logs, alerting' },
      { name: 'System Design', level: 83, note: 'Scoping, trade-offs, technical writing' },
    ],
  },
];

export default skills;
