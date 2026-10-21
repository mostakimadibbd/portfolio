import { test, before, after, describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

// Test environment must be configured before the app module graph is loaded.
process.env.NODE_ENV = 'test';
process.env.MESSAGES_FILE = path.join(tmpdir(), `portfolio-test-${Date.now()}.json`);

let app;
let request;

before(async () => {
  const { createApp } = await import('../server/app.js');
  const supertest = (await import('supertest')).default;
  app = createApp();
  request = supertest(app);
});

after(async () => {
  await rm(process.env.MESSAGES_FILE, { force: true });
});

describe('GET /', () => {
  test('renders the home page with the owner name', async () => {
    const response = await request.get('/').expect(200);

    assert.match(response.headers['content-type'], /text\/html/);
    assert.ok(response.text.includes('Mostakim Adib'));
    assert.ok(response.text.includes('Selected work'));
    assert.ok(response.text.includes('id="contact"'));
  });

  test('server-renders project cards without any client JavaScript', async () => {
    const response = await request.get('/').expect(200);
    assert.ok(response.text.includes('data-tags='));
    assert.ok(response.text.includes('project-card'));
  });
});

describe('GET /api/v1/health', () => {
  test('reports service status', async () => {
    const response = await request.get('/api/v1/health').expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, 'ok');
    assert.equal(response.body.data.environment, 'test');
  });
});

describe('GET /api/v1/site', () => {
  test('returns the aggregate payload used by the frontend', async () => {
    const response = await request.get('/api/v1/site').expect(200);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.profile.name, 'Mostakim Adib');
    assert.ok(Array.isArray(response.body.data.skills));
    assert.ok(Array.isArray(response.body.data.experience));
    assert.ok(Array.isArray(response.body.data.tags));
  });
});

describe('GET /api/v1/projects', () => {
  test('returns projects with pagination metadata', async () => {
    const response = await request.get('/api/v1/projects').expect(200);

    assert.equal(response.body.success, true);
    assert.ok(response.body.data.length > 0);
    assert.ok(response.body.meta.total >= response.body.data.length);
    assert.equal(response.body.meta.page, 1);
  });

  test('filters by featured flag', async () => {
    const response = await request.get('/api/v1/projects?featured=true').expect(200);

    assert.ok(response.body.data.length > 0);
    assert.ok(response.body.data.every((project) => project.featured === true));
  });

  test('filters by tag', async () => {
    const response = await request.get('/api/v1/projects?tag=PyTorch').expect(200);

    assert.ok(response.body.data.length > 0);
    assert.ok(response.body.data.every((project) => project.tags.includes('PyTorch')));
  });

  test('filters by search term', async () => {
    const response = await request.get('/api/v1/projects?search=recommender').expect(200);

    assert.ok(response.body.data.length > 0);
    assert.ok(response.body.data.every((project) => /recommender/i.test(project.title + project.summary)));
  });

  test('rejects invalid pagination values', async () => {
    const response = await request.get('/api/v1/projects?page=0').expect(400);

    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, 'BAD_REQUEST');
    assert.ok(Array.isArray(response.body.error.details));
  });
});

describe('GET /api/v1/projects/:slug', () => {
  test('returns a single project', async () => {
    const response = await request.get('/api/v1/projects/atlas-doc-intelligence').expect(200);

    assert.equal(response.body.data.slug, 'atlas-doc-intelligence');
    assert.equal(response.body.data.title, 'Atlas — Document Intelligence Platform');
  });

  test('returns 404 for an unknown slug', async () => {
    const response = await request.get('/api/v1/projects/does-not-exist').expect(404);

    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, 'NOT_FOUND');
  });
});

describe('POST /api/v1/contact', () => {
  const validPayload = {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    subject: 'ML Engineer role',
    message: 'I would like to talk about an ML engineering position on your team.',
  };

  test('accepts and stores a valid message', async () => {
    const response = await request.post('/api/v1/contact').send(validPayload).expect(201);

    assert.equal(response.body.success, true);
    assert.equal(response.body.data.received, true);
    assert.ok(response.body.data.id);
  });

  test('rejects an invalid email address', async () => {
    const response = await request
      .post('/api/v1/contact')
      .send({ ...validPayload, email: 'not-an-email' })
      .expect(400);

    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, 'BAD_REQUEST');
    assert.ok(response.body.error.details.some((issue) => issue.field === 'email'));
  });

  test('rejects a message that is too short', async () => {
    const response = await request
      .post('/api/v1/contact')
      .send({ ...validPayload, message: 'hi' })
      .expect(400);

    assert.equal(response.body.success, false);
    assert.ok(response.body.error.details.some((issue) => issue.field === 'message'));
  });

  test('silently accepts honeypot submissions without storing them', async () => {
    const response = await request
      .post('/api/v1/contact')
      .send({ ...validPayload, company: 'spam-co' })
      .expect(201);

    assert.equal(response.body.data.received, true);
    assert.equal(response.body.data.id, undefined);
  });
});

describe('static assets', () => {
  test('serves the stylesheet', async () => {
    const response = await request.get('/css/main.css').expect(200);
    assert.match(response.headers['content-type'], /text\/css/);
  });

  test('serves the client bundle', async () => {
    const response = await request.get('/js/main.js').expect(200);
    assert.match(response.headers['content-type'], /javascript/);
  });
});

describe('unknown routes', () => {
  test('respond with a JSON 404 envelope', async () => {
    const response = await request.get('/api/v1/nope').expect(404);

    assert.equal(response.body.success, false);
    assert.equal(response.body.error.code, 'NOT_FOUND');
  });
});
