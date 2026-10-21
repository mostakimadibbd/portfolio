/**
 * Portfolio projects. `tags` drive the filter chips on the site.
 */
export const projects = [
  {
    id: 'prj_01',
    slug: 'atlas-doc-intelligence',
    title: 'Atlas — Document Intelligence Platform',
    summary:
      'A production document-understanding platform that ingests, classifies and extracts structured data from millions of PDFs, invoices and scanned forms.',
    description:
      'Atlas replaces a manual review workflow with a hybrid pipeline: layout-aware OCR, a fine-tuned transformer for document classification, and a rule-plus-ensemble extractor for key-value pairs. The system ships behind a typed REST and gRPC API consumed by a React operations console.',
    year: 2025,
    featured: true,
    status: 'Production',
    role: 'Lead ML & Backend Engineer',
    teamSize: 4,
    tags: ['Machine Learning', 'NLP', 'Python', 'FastAPI', 'PyTorch', 'PostgreSQL', 'Docker', 'Kubernetes'],
    metrics: [
      { label: 'Manual review effort', value: '-82%' },
      { label: 'Extraction F1', value: '0.94' },
      { label: 'Throughput', value: '1.4k docs/min' },
    ],
    links: { repo: 'https://github.com/mostakimadib/atlas-doc-intelligence', demo: null, caseStudy: null },
    highlights: [
      'Fine-tuned a DeBERTa classifier across 40 document classes with a 4 % error reduction versus the baseline.',
      'Designed a versioned feature and label pipeline that made training runs fully reproducible.',
      'Introduced drift monitoring with automatic rollback when class distribution shifted.',
    ],
  },
  {
    id: 'prj_02',
    slug: 'signal-recommender',
    title: 'Signal — Hybrid Recommender',
    summary:
      'A real-time recommendation engine blending collaborative filtering with a two-tower embedding model for session-aware suggestions.',
    description:
      'Signal serves personalised feeds for a streaming product. It combines a matrix-factorisation baseline with a two-tower neural retrieval model, re-ranks candidates with a gradient-boosted model, and falls back gracefully when signals are cold.',
    year: 2025,
    featured: true,
    status: 'Production',
    role: 'Machine Learning Engineer',
    teamSize: 3,
    tags: ['Machine Learning', 'Recommenders', 'PyTorch', 'Redis', 'Kafka', 'Node.js', 'React'],
    metrics: [
      { label: 'CTR lift', value: '+23%' },
      { label: 'p99 latency', value: '38 ms' },
      { label: 'Recall@20', value: '0.71' },
    ],
    links: { repo: 'https://github.com/mostakimadib/signal-recommender', demo: null, caseStudy: null },
    highlights: [
      'Built an ANN index over 40M item embeddings serving candidates in under 30 ms.',
      'Added a cold-start strategy that lifted new-user engagement by 17 %.',
      'Shipped an offline evaluation harness with counterfactual analysis.',
    ],
  },
  {
    id: 'prj_03',
    slug: 'sight-edge-vision',
    title: 'Sight — Edge Vision Analytics',
    summary:
      'A computer-vision pipeline for manufacturing lines that runs on constrained edge hardware and detects defects in real time.',
    description:
      'Sight is a YOLO-based defect detection system with a dedicated edge inference layer. Models are exported to ONNX, quantised to INT8 and served through TensorRT on Jetson-class devices, with thermal-aware scheduling to keep throughput stable.',
    year: 2024,
    featured: true,
    status: 'Production',
    role: 'ML Engineer & Edge Systems Developer',
    teamSize: 2,
    tags: ['Computer Vision', 'PyTorch', 'ONNX', 'TensorRT', 'C++', 'Docker', 'IoT'],
    metrics: [
      { label: 'Inference latency', value: '12 ms' },
      { label: 'Defect recall', value: '0.97' },
      { label: 'Power draw', value: '-38%' },
    ],
    links: { repo: 'https://github.com/mostakimadib/sight-edge-vision', demo: null, caseStudy: null },
    highlights: [
      'Reduced model footprint from 220 MB to 54 MB with post-training INT8 quantisation.',
      'Achieved 34 frames per second per edge device while holding recall above 0.95.',
      'Built a labelling and active-learning loop that cut annotation cost by half.',
    ],
  },
  {
    id: 'prj_04',
    slug: 'atlas-chat-assistant',
    title: 'Atlas Assistant — RAG Support Copilot',
    summary:
      'A retrieval-augmented support assistant grounding every answer in verified product documentation, with citations and evaluation harness.',
    description:
      'The assistant combines hybrid BM25 and dense retrieval, a cross-encoder reranker and a tool layer that queries live account data. Answers are always grounded with citations, and a golden-dataset harness tracks answer faithfulness over time.',
    year: 2024,
    featured: false,
    status: 'Production',
    role: 'Founding Engineer',
    teamSize: 2,
    tags: ['NLP', 'LLM', 'RAG', 'Python', 'FastAPI', 'pgvector', 'React'],
    metrics: [
      { label: 'Grounded answers', value: '96%' },
      { label: 'Deflection rate', value: '+31%' },
      { label: 'p95 latency', value: '1.2 s' },
    ],
    links: { repo: null, demo: null, caseStudy: null },
    highlights: [
      'Replaced a naive vector store with hybrid retrieval, lifting answer precision by 19 points.',
      'Introduced faithfulness scoring over a hand-built golden dataset of 400 questions.',
      'Added citation verification that blocks unsupported claims from reaching customers.',
    ],
  },
  {
    id: 'prj_05',
    slug: 'ledger-fintech-platform',
    title: 'Ledger — Full-Stack Fintech Platform',
    summary:
      'A multi-tenant accounting and payouts platform with a typed API, event-driven ledger and a real-time operations dashboard.',
    description:
      'Ledger handles double-entry accounting, reconciliation and payouts for small businesses. A transactional PostgreSQL schema guarantees balance integrity, an outbox pattern keeps the ledger and downstream analytics consistent, and the dashboard streams live changes over WebSockets.',
    year: 2024,
    featured: false,
    status: 'Production',
    role: 'Full-Stack Engineer',
    teamSize: 5,
    tags: ['Full-Stack', 'TypeScript', 'Node.js', 'React', 'PostgreSQL', 'Redis', 'GraphQL', 'AWS'],
    metrics: [
      { label: 'Payout volume', value: '$40M+' },
      { label: 'Uptime', value: '99.98%' },
      { label: 'API p95', value: '110 ms' },
    ],
    links: { repo: null, demo: null, caseStudy: null },
    highlights: [
      'Implemented an idempotent, event-sourced ledger with automated reconciliation reports.',
      'Cut cold-start render time by 58 % through streaming SSR and route-level code splitting.',
      'Introduced contract tests that prevented 30+ breaking API changes.',
    ],
  },
  {
    id: 'prj_06',
    slug: 'forecast-demand-planning',
    title: 'Forecast — Demand Planning Toolkit',
    summary:
      'An interpretable forecasting suite combining statistical baselines, gradient boosting and hierarchical reconciliation for retail demand.',
    description:
      'Forecast gives planners probabilistic demand estimates rather than a single number. It benchmarks classical models against boosted trees, reconciles predictions across product hierarchies, and exposes a visual interface for override and scenario planning.',
    year: 2023,
    featured: false,
    status: 'Production',
    role: 'Data Scientist / ML Engineer',
    teamSize: 3,
    tags: ['Machine Learning', 'Time Series', 'Python', 'XGBoost', 'Airflow', 'TimescaleDB'],
    metrics: [
      { label: 'WAPE', value: '-21%' },
      { label: 'SKUs modelled', value: '1.2M' },
      { label: 'Planning time saved', value: '9 hrs/wk' },
    ],
    links: { repo: null, demo: null, caseStudy: null },
    highlights: [
      'Built a hierarchical reconciliation layer that improved aggregate forecast accuracy by 21 %.',
      'Made every prediction explainable with automated feature attribution reports.',
      'Automated the full nightly retraining and backfill pipeline with Airflow.',
    ],
  },
  {
    id: 'prj_07',
    slug: 'pulse-observability',
    title: 'Pulse — Model Observability Platform',
    summary:
      'A lightweight observability service for machine-learning systems capturing drift, latency and data-quality signals in one place.',
    description:
      'Pulse is the missing dashboard for ML systems. It ingests inference logs, computes per-feature drift, tracks business KPIs against model outputs and alerts before degradation becomes an incident. It ships as a single container with a Postgres backend.',
    year: 2023,
    featured: false,
    status: 'Open Source',
    role: 'Creator & Maintainer',
    teamSize: 1,
    tags: ['MLOps', 'Python', 'FastAPI', 'React', 'TimescaleDB', 'Docker'],
    metrics: [
      { label: 'GitHub stars', value: '1.2k' },
      { label: 'Signals tracked', value: '40+' },
      { label: 'Setup time', value: '< 5 min' },
    ],
    links: { repo: 'https://github.com/mostakimadib/pulse', demo: null, caseStudy: null },
    highlights: [
      'Designed a tiny, opinionated API that ingests drift signals from any framework.',
      'Added alerting rules with configurable thresholds and incident history.',
      'Published 40+ integration examples across PyTorch, scikit-learn and ONNX.',
    ],
  },
  {
    id: 'prj_08',
    slug: 'nexa-engineering-blog',
    title: 'Nexa — Engineering Knowledge Base',
    summary:
      'A fast, offline-first documentation platform with full-text search, versioning and a plugin API for internal tooling.',
    description:
      'Nexa is a self-hosted knowledge base used by engineering teams to document runbooks and decisions. It ships with incremental static generation, offline search, semantic version history and a plugin system that extends pages with live operational data.',
    year: 2022,
    featured: false,
    status: 'Open Source',
    role: 'Creator',
    teamSize: 1,
    tags: ['Full-Stack', 'TypeScript', 'Node.js', 'React', 'SQLite', 'Web Workers'],
    metrics: [
      { label: 'Search latency', value: '< 10 ms' },
      { label: 'Build time', value: '1.8 s' },
      { label: 'Docs pages', value: '400+' },
    ],
    links: { repo: 'https://github.com/mostakimadib/nexa', demo: null, caseStudy: null },
    highlights: [
      'Implemented a Web Worker powered inverted index for instant offline search.',
      'Added incremental builds that reduced rebuild time by 90 %.',
      'Designed a plugin API now used by four internal integrations.',
    ],
  },
];

export default projects;
