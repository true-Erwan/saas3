"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

type GenerationState = "idle" | "loading" | "error" | "done";

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [subscribersCount, setSubscribersCount] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
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

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data: { subscribers?: number }) => {
        setSubscribersCount(data.subscribers ?? 0);
      })
      .catch(() => setSubscribersCount(null));
  }, [isAuthenticated]);

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
        body: JSON.stringify({
          subject,
          topic,
          content,
          scheduledAt,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setScheduleMessage(
          data.error || "Erreur lors de la planification de l'envoi.",
        );
        return;
      }
      setScheduleMessage("Newsletter planifiée avec succès !");
    } catch {
      setScheduleMessage("Erreur réseau lors de la planification.");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-lg shadow-black/40">
          <h1 className="text-xl font-semibold mb-2">WeeklyTroll · Admin</h1>
          <p className="text-xs text-zinc-400 mb-4">
            Cette zone est réservée aux trolls professionnels.
          </p>
          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Mot de passe admin"
              className="rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-2 text-sm outline-none focus:border-emerald-400 transition-colors"
            />
            {authError && (
              <p className="text-xs text-red-400">{authError}</p>
            )}
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-emerald-950 shadow-md shadow-emerald-500/40 hover:bg-emerald-400 transition-colors"
            >
              Entrer
            </button>
          </form>
          <p className="mt-3 text-[11px] text-zinc-500">
            Définissez le vrai mot de passe via
            {" "}
            <code className="px-1 py-0.5 rounded bg-zinc-800 text-[10px]">
              NEXT_PUBLIC_ADMIN_PASSWORD
            </code>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center">
      <main className="w-full max-w-4xl px-6 py-10 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="inline-flex items-center rounded-full bg-zinc-900 border border-zinc-800 px-4 py-1 text-[11px] font-medium text-zinc-300 w-fit">
            WeeklyTroll · Dashboard Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Préparez la newsletter hebdomadaire.
          </h1>
          <p className="text-xs text-zinc-400">
            Définissez un thème, laissez l&apos;IA troller pour vous, puis
            programmez l&apos;envoi.
          </p>
          <a
            href="/admin/news-later"
            className="text-xs text-emerald-300 hover:text-emerald-200 underline underline-offset-4 w-fit"
          >
            Ouvrir News Later (génération automatique depuis un lien)
          </a>
        </header>

        <section className="grid gap-6 sm:grid-cols-[1.3fr,1fr]">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-medium">Éditeur de newsletter</h2>
              <span className="text-[11px] text-zinc-500">
                Abonnés :{" "}
                {subscribersCount === null
                  ? "—"
                  : subscribersCount}
              </span>
            </div>

            <form className="flex flex-col gap-3" onSubmit={handleGenerate}>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-300">
                  Thème de la semaine
                </span>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex : Startups IA qui lèvent sans produit"
                  className="rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm outline-none focus:border-emerald-400 transition-colors"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-medium text-emerald-950 shadow-md shadow-emerald-500/40 hover:bg-emerald-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={genState === "loading"}
              >
                {genState === "loading" ? (
                  <>
                    <span className="inline-flex h-3 w-16 overflow-hidden rounded-full bg-emerald-700/60">
                      <span className="h-full w-1/3 bg-emerald-300 animate-[progress_1s_ease-in-out_infinite]" />
                    </span>
                    Génération en cours…
                  </>
                ) : (
                  "Générer avec Groq"
                )}
              </button>

              {genState === "error" && genError && (
                <p className="text-xs text-red-400">{genError}</p>
              )}
              {genState === "done" && (
                <p className="text-xs text-emerald-300">
                  Contenu généré avec succès, vous pouvez l&apos;éditer ci-dessous.
                </p>
              )}
            </form>

            <form className="flex flex-col gap-3" onSubmit={handleSchedule}>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-300">Sujet de l&apos;email</span>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="WeeklyTroll · Votre résumé de la semaine"
                  className="rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm outline-none focus:border-emerald-400 transition-colors"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-300">Contenu</span>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-xs outline-none focus:border-emerald-400 transition-colors resize-y"
                  placeholder="Le contenu de la newsletter généré ou écrit à la main."
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs text-zinc-300">
                  Date et heure d&apos;envoi
                </span>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-xs outline-none focus:border-emerald-400 transition-colors"
                />
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-zinc-100 text-zinc-950 px-4 py-2 text-xs font-medium shadow-md shadow-zinc-100/30 hover:bg-white transition-colors"
              >
                Planifier l&apos;envoi
              </button>

              {scheduleMessage && (
                <p className="text-xs text-zinc-300">{scheduleMessage}</p>
              )}
            </form>
          </div>

          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 sm:p-6 flex flex-col gap-4 text-xs text-zinc-300">
            <h2 className="text-sm font-medium mb-1">Aperçu & aide</h2>
            <div className="border border-zinc-800 rounded-xl p-3 bg-zinc-950/40 overflow-auto max-h-80">
              {content ? (
                <pre className="whitespace-pre-wrap text-[11px] leading-relaxed">
                  {content}
                </pre>
              ) : (
                <p className="text-[11px] text-zinc-500">
                  Le contenu généré apparaîtra ici. Utilisez un ton léger,
                  quelques punchlines, et terminez par un call-to-action malin.
                </p>
              )}
            </div>
            <ul className="list-disc list-inside text-[11px] text-zinc-400 space-y-1">
              <li>
                Le système vérifie automatiquement les newsletters planifiées
                chaque heure et envoie celles dont la date est passée.
              </li>
              <li>
                Configurez votre SMTP via
                {" "}
                <code className="px-1 py-0.5 rounded bg-zinc-800 text-[10px]">
                  SMTP_USER
                </code>
                {" "}
                et
                {" "}
                <code className="px-1 py-0.5 rounded bg-zinc-800 text-[10px]">
                  SMTP_PASS
                </code>
                .
              </li>
              <li>
                Configurez Groq via
                {" "}
                <code className="px-1 py-0.5 rounded bg-zinc-800 text-[10px]">
                  GROQ_API_KEY
                </code>
                .
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

