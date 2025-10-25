import { openDB, IDBPDatabase } from 'idb';

export type NovaDB = IDBPDatabase<unknown>;

const DB_NAME = 'nova';
const DB_VERSION = 1;

export type PlaySessionRecord = {
  id: string; // uuid
  startedAt: number;
  finishedAt?: number;
  profile?: { name?: string; ageBand?: '13-14' | '15-16' | '17-18'; avatar?: string };
  decisions: Array<{
    eventId: string;
    choiceId: string;
    at: number;
    metricDeltas: Record<string, number>;
    achievement?: string | null;
  }>;
  metrics: Record<string, number>;
  achievements: string[];
  seenEventIds?: string[];
  locale?: string;
  contentVersion?: string;
  reflection?: string;
};

let dbPromise: Promise<NovaDB> | null = null;

export function getDB(): Promise<NovaDB> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('sessions')) {
          const store = db.createObjectStore('sessions', { keyPath: 'id' });
          store.createIndex('by_startedAt', 'startedAt');
        }
      },
    });
  }
  return dbPromise;
}

export async function saveSession(session: PlaySessionRecord) {
  const db = await getDB();
  await db.put('sessions', session);
}

export async function listSessions(): Promise<PlaySessionRecord[]> {
  const db = await getDB();
  return await db.getAll('sessions');
}

export async function getSession(id: string): Promise<PlaySessionRecord | undefined> {
  const db = await getDB();
  return await db.get('sessions', id);
}

export async function exportSessions(): Promise<string> {
  const sessions = await listSessions();
  return JSON.stringify({ kind: 'nova-sessions', version: 1, sessions }, null, 2);
}

export async function importSessions(json: string): Promise<number> {
  const parsed = JSON.parse(json) as { kind: string; version: number; sessions: PlaySessionRecord[] };
  if (parsed.kind !== 'nova-sessions') throw new Error('Invalid file kind');
  let count = 0;
  for (const s of parsed.sessions) {
    await saveSession(s);
    count += 1;
  }
  return count;
}

export async function clearSessions(): Promise<void> {
  const db = await getDB();
  await db.clear('sessions');
}


