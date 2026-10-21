/**
 * Persistent, file-backed store for contact form submissions.
 * Uses an in-memory cache with atomic writes so the API stays fast and
 * the process never blocks on a slow disk for a request.
 */
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import config from '../config/index.js';
import logger from '../utils/logger.js';

let cache = null;
let writeQueue = Promise.resolve();

const filePath = config.storage.messagesFile;

const ensureDir = async (path) => {
  await mkdir(dirname(path), { recursive: true });
};

const load = async () => {
  if (cache) return cache;
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    cache = Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code !== 'ENOENT') {
      logger.warn('Could not read message store, starting empty', { message: error.message });
    }
    cache = [];
  }
  return cache;
};

const persist = async () => {
  await ensureDir(filePath);
  const tempPath = `${filePath}.tmp`;
  await writeFile(tempPath, JSON.stringify(cache, null, 2), 'utf8');
  await rename(tempPath, filePath);
};

/** Serialises writes so concurrent requests cannot interleave. */
const enqueuePersist = () => {
  writeQueue = writeQueue
    .then(persist)
    .catch((error) => logger.error('Failed to persist messages', { message: error.message }));
  return writeQueue;
};

export const messageStore = {
  async list() {
    return [...(await load())].reverse();
  },

  async add(message) {
    const messages = await load();
    const record = { id: crypto.randomUUID(), receivedAt: new Date().toISOString(), ...message };
    messages.push(record);
    if (messages.length > config.storage.maxMessages) messages.splice(0, messages.length - config.storage.maxMessages);
    await enqueuePersist();
    return record;
  },

  async count() {
    return (await load()).length;
  },

  async clear() {
    cache = [];
    await enqueuePersist();
  },
};

export default messageStore;
