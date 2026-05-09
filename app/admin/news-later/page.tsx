"use client";

import { useState, useSyncExternalStore } from "react";

type GenerationState = "idle" | "loading" | "error" | "done";

function getDefaultSchedule(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  const tz = new Date(d.getTime() - d.getTimezoneOffset() * 60 * 1000);
  return tz.toISOString().slice(0, 16);
}

export default function NewsLaterPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState(getDefaultSchedule());
  const [genState, setGenState] = useState<GenerationState>("idle");
  const [genError, setGenError] = useState<string | null>(null);
  const [scheduleMessage, setScheduleMessage] = useState<string | null>(null);

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

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setGenState("loading");
    setGenError(null);

    try {
      const res = await fetch("/api/newsletters/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenState("error");
        setGenError(data.error || "Erreur de génération.");
        return;
      }
      setContent(data.content || "");
      if (!subject.trim()) {
        setSubject(`WeeklyTroll · ${topic}`);
      }
      setGenState("done");
    } catch {
      setGenState("error");
      setGenError("Erreur réseau lors de la génération.");
    }
  }

  async function handleSchedule(e: React.FormEvent) {
    e.preventDefault();
    setScheduleMessage(null);
    if (!subject.trim() || !topic.trim() || !content.trim() || !scheduledAt) {
      setScheduleMessage(
        "Merci de remplir le sujet, le thème, le contenu et la date/heure.",
      );
      return;
    }
    try {
      const res = await fetch("/api/newsletters/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, topic, content, scheduledAt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScheduleMessage(data.error || "Erreur de planification.");
        return;
      }
      setScheduleMessage("News Later planifiée avec succès.");
    } catch {
      setScheduleMessage("Erreur réseau.");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="page-shell flex items-center justify-center px-4">
        <div className="panel w-full max-w-sm rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-2">WeeklyTroll · News Later</h1>
          <p className="text-xs text-[var(--text-ash)] mb-4">
            Authentification admin requise.
          </p>
          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Mot de passe admin"
              className="ui-input px-2 py-2 text-sm"
            />
            {authError && <p className="text-xs text-red-400">{authError}</p>}
            <button
              type="submit"
              className="ui-button inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium"
            >
              Entrer
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell flex flex-col items-center">
      <main className="w-full max-w-4xl px-6 py-10 flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="badge inline-flex items-center rounded-full px-4 py-1 text-[11px] font-medium w-fit">
            WeeklyTroll · News Later
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Créez et planifiez votre newsletter.
          </h1>
          <p className="text-xs text-[var(--text-ash)]">
            Définissez un thème, générez avec Groq, puis programmez l&apos;envoi.
          </p>
          <a
            href="/admin"
            className="ui-subtle-link text-xs w-fit"
          >
            Retour au dashboard admin
          </a>
        </header>

        <section className="panel rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <form className="flex flex-col gap-3" onSubmit={handleGenerate}>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-zinc-300">Thème de la semaine</span>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ex: IA, crypto, startups..."
                className="ui-input px-2 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={genState === "loading"}
              className="ui-button inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {genState === "loading" ? "Génération en cours..." : "Générer avec Groq"}
            </button>
          </form>

          {genState === "loading" && (
            <div className="flex flex-col gap-2">
              <span className="inline-flex h-2 w-full overflow-hidden rounded-full bg-emerald-700/50">
                <span className="h-full w-1/4 bg-emerald-300 animate-[progress_1s_ease-in-out_infinite]" />
              </span>
              <p className="text-xs text-[var(--accent-magic)]">Génération du contenu...</p>
            </div>
          )}

          {genError && <p className="text-xs text-red-400">{genError}</p>}
        </section>

        <section className="panel rounded-2xl p-5 sm:p-6">
          <h2 className="text-sm font-medium mb-3">Éditeur & planification</h2>
          <form className="flex flex-col gap-3" onSubmit={handleSchedule}>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-zinc-300">Sujet email</span>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="ui-input px-2 py-2 text-sm"
                placeholder="WeeklyTroll · Votre news de la semaine"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-zinc-300">Contenu</span>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="ui-input px-2 py-2 text-xs resize-y"
                placeholder="Votre contenu de newsletter..."
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-zinc-300">Date/heure d&apos;envoi</span>
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="ui-input px-2 py-2 text-xs"
              />
            </label>
            <button
              type="submit"
              className="ui-button inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium"
            >
              Planifier News Later
            </button>
            {scheduleMessage && <p className="text-xs text-zinc-300">{scheduleMessage}</p>}
          </form>
        </section>
      </main>
    </div>
  );
}

