import { promises as fs } from "fs";
import path from "path";

export type Subscriber = {
  email: string;
  createdAt: string;
};

export type NewsletterStatus = "pending" | "sent";

export type Newsletter = {
  id: string;
  subject: string;
  topic: string;
  content: string;
  scheduledAt: string;
  status: NewsletterStatus;
  createdAt: string;
};

type DbShape = {
  subscribers: Subscriber[];
  newsletters: Newsletter[];
};

const DB_FILE = path.join(process.cwd(), "data", "weeklytroll-db.json");

async function ensureDbFile(): Promise<void> {
  const dir = path.dirname(DB_FILE);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    // ignore
  }

  try {
    await fs.access(DB_FILE);
  } catch {
    const initial: DbShape = { subscribers: [], newsletters: [] };
    await fs.writeFile(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
  }
}

async function readDb(): Promise<DbShape> {
  await ensureDbFile();
  const raw = await fs.readFile(DB_FILE, "utf8");
  return JSON.parse(raw) as DbShape;
}

async function writeDb(db: DbShape): Promise<void> {
  await ensureDbFile();
  await fs.writeFile(DB_FILE, JSON.stringify(db, null, 2), "utf8");
}

export async function addSubscriber(email: string): Promise<Subscriber> {
  const db = await readDb();
  const existing = db.subscribers.find(
    (s) => s.email.toLowerCase() === email.toLowerCase(),
  );
  if (existing) return existing;

  const sub: Subscriber = {
    email,
    createdAt: new Date().toISOString(),
  };
  db.subscribers.push(sub);
  await writeDb(db);
  return sub;
}

export async function getSubscribersCount(): Promise<number> {
  const db = await readDb();
  return db.subscribers.length;
}

export async function createNewsletter(input: {
  subject: string;
  topic: string;
  content: string;
  scheduledAt: string;
}): Promise<Newsletter> {
  const db = await readDb();
  const newsletter: Newsletter = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    subject: input.subject,
    topic: input.topic,
    content: input.content,
    scheduledAt: input.scheduledAt,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  db.newsletters.push(newsletter);
  await writeDb(db);
  return newsletter;
}

export async function getPendingNewslettersUntil(
  untilIso: string,
): Promise<Newsletter[]> {
  const db = await readDb();
  const now = new Date(untilIso).getTime();
  return db.newsletters.filter(
    (n) => n.status === "pending" && new Date(n.scheduledAt).getTime() <= now,
  );
}

export async function markNewsletterSent(id: string): Promise<void> {
  const db = await readDb();
  const idx = db.newsletters.findIndex((n) => n.id === id);
  if (idx === -1) return;
  db.newsletters[idx] = { ...db.newsletters[idx], status: "sent" };
  await writeDb(db);
}

