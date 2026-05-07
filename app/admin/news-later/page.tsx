"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

type State = "idle" | "loading" | "error" | "done";

function getDefaultSchedule(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
  return tz.toISOString().slice(0, 16);
}

export default function NewsLaterPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [url, setUrl] = useState("");
  const [scheduledAt, setScheduledAt] = useState(getDefaultSchedule());
  const [status, setStatus] = useState<State>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    subject: string;
    topic: string;
    content: string;
    scheduledAt: string;
  } | null>(null);

  const progressText = useMemo(() => {
    if (status !== "loading") return "";
    return "Extraction du site + génération IA + planification...";
  }, [status]);

  const isAuthenticated = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === "undefined") return () => {};
      const handler = () => onStoreChange();
      window.addEventListener("storage", handler);
      window.addEventListener("weeklytroll-auth", handler);
      return () => {
        window.removeEventListener("storage", handler);
        window.removeEventListener("weeklytroll-auth", handler);
      };
    },
    () => {
      if (typeof window === "undefined") return false;
      return window.localStorage.getItem("weeklytroll-admin") === "ok";
    },
    () => false,
  );

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "2cb";
    if (passwordInput === expected) {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("weeklytroll-admin", "ok");
        window.dispatchEvent(new Event("weeklytroll-auth"));
      }
      setAuthError(null);
    } else {
      setAuthError("Mot de passe incorrect.");
    }
  }

  async function handleGenerateFromUrl(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage(null);
    setPreview(null);

    try {
      const res = await fetch("/api/newsletters/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, scheduledAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Erreur durant la génération automatique.");
        return;
      }

      setStatus("done");
      setMessage("News Later générée et planifiée automatiquement.");
      setPreview({
        subject: data.newsletter.subject,
        topic: data.newsletter.topic,
        content: data.newsletter.content,
        scheduledAt: data.newsletter.scheduledAt,
      });
    } catch {
      setStatus("error");
      setMessage("Erreur réseau.");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-lg shadow-black/40">
          <h1 className="text-xl font-semibold mb-2">WeeklyTroll · News Later</h1>
          <p className="text-xs text-zinc-400 mb-4">
            Authentification admin requise.
          </p>
          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Mot de passe admin"
              className="rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
            {authError && <p className="text-xs text-red-400">{authError}</p>}
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 shadow-md shadow-emerald-500/40 hover:bg-emerald-400 transition-colors"
            >
              Entrer
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center">
      <main className="w-full max-w-4xl px-6 py-10 flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="inline-flex items-center rounded-full bg-zinc-900 border border-zinc-800 px-4 py-1 text-[11px] font-medium text-zinc-300 w-fit">
            WeeklyTroll · News Later
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Générez une newsletter automatiquement depuis un lien.
          </h1>
          <p className="text-xs text-zinc-400">
            Collez l&apos;URL d&apos;un site, on extrait le contenu, on génère la
            newsletter via Groq (même clé API), puis on la planifie.
          </p>
          <a
            href="/admin"
            className="text-xs text-zinc-300 hover:text-zinc-100 underline underline-offset-4 w-fit"
          >
            Retour au dashboard admin
          </a>
        </header>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 flex flex-col gap-4">
          <form className="flex flex-col gap-3" onSubmit={handleGenerateFromUrl}>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-zinc-300">Lien du site</span>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemple.com/article"
                className="rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm outline-none focus:border-emerald-400 transition-colors"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-zinc-300">Date/heure d&apos;envoi</span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-xs outline-none focus:border-emerald-400 transition-colors"
              />
            </label>
            <button
              type="submit"
              disabled={status === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-emerald-950 shadow-md shadow-emerald-500/40 hover:bg-emerald-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Génération en cours..." : "Générer News Later"}
            </button>
          </form>

          {status === "loading" && (
            <div className="flex flex-col gap-2">
              <span className="inline-flex h-2 w-full overflow-hidden rounded-full bg-emerald-700/50">
                <span className="h-full w-1/4 bg-emerald-300 animate-[progress_1s_ease-in-out_infinite]" />
              </span>
              <p className="text-xs text-emerald-300">{progressText}</p>
            </div>
          )}

          {message && (
            <p className={`text-xs ${status === "error" ? "text-red-400" : "text-zinc-200"}`}>
              {message}
            </p>
          )}
        </section>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6">
          <h2 className="text-sm font-medium mb-2">Aperçu généré</h2>
          {preview ? (
            <div className="space-y-2 text-xs text-zinc-300">
              <p>
                <span className="text-zinc-500">Sujet:</span> {preview.subject}
              </p>
              <p>
                <span className="text-zinc-500">Thème:</span> {preview.topic}
              </p>
              <p>
                <span className="text-zinc-500">Planifié pour:</span>{" "}
                {new Date(preview.scheduledAt).toLocaleString()}
              </p>
              <pre className="mt-2 whitespace-pre-wrap rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 text-[11px] leading-relaxed">
                {preview.content}
              </pre>
            </div>
          ) : (
            <p className="text-[11px] text-zinc-500">
              Aucun contenu généré pour le moment.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}

