import { getPendingNewslettersUntil, markNewsletterSent } from "./db";
import { sendNewsletterEmail } from "./email";
import { promises as fs } from "fs";
import path from "path";

async function getAllSubscriberEmails(): Promise<string[]> {
  const dbPath = path.join(process.cwd(), "data", "weeklytroll-db.json");
  try {
    const raw = await fs.readFile(dbPath, "utf8");
    const parsed = JSON.parse(raw) as {
      subscribers?: { email: string }[];
    };
    return (parsed.subscribers || []).map((s) => s.email);
  } catch {
    return [];
  }
}

async function runOnce() {
  const nowIso = new Date().toISOString();
  const pending = await getPendingNewslettersUntil(nowIso);
  if (pending.length === 0) return;

  const emails = await getAllSubscriberEmails();
  if (emails.length === 0) return;

  for (const n of pending) {
    await sendNewsletterEmail({
      subject: n.subject,
      html: n.content,
      to: emails,
    });
    await markNewsletterSent(n.id);
  }
}

function startScheduler() {
  // Avoid starting multiple intervals in dev/hot reload
  // @ts-expect-error attach to global
  if (global.__weeklytroll_scheduler_started) {
    return;
  }
  // @ts-expect-error attach to global
  global.__weeklytroll_scheduler_started = true;

  // Simulate a cron every hour. For local testing you can reduce this delay.
  const intervalMs = 60 * 60 * 1000;

  console.log("[WeeklyTroll] Scheduler started (runs hourly).");

  // Run once on startup, then on interval.
  void runOnce();
  setInterval(() => {
    void runOnce();
  }, intervalMs);
}

startScheduler();

export {};

