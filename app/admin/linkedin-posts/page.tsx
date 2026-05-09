"use client";

import { useState, useSyncExternalStore } from "react";

type GenState = "idle" | "loading" | "error" | "done";

export default function LinkedinPostsPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [url, setUrl] = useState("");
  const [state, setState] = useState<GenState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [post, setPost] = useState("");
  const [hook, setHook] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [sourceTitle, setSourceTitle] = useState("");

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
    setState("loading");
    setMessage(null);
    setPost("");
    setHook("");
    setHashtags([]);
    setSourceTitle("");

    try {
      const res = await fetch("/api/linkedin/from-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState("error");
        setMessage(data.error || "Erreur de génération.");
        return;
      }
      setState("done");
      setMessage("Post LinkedIn généré.");
      setPost(data.post || "");
      setHook(data.hook || "");
      setHashtags(data.hashtags || []);
      setSourceTitle(data.sourceTitle || "");
    } catch {
      setState("error");
      setMessage("Erreur réseau.");
    }
  }

  async function copyPost() {
    if (!post) return;
    await navigator.clipboard.writeText(post);
    setMessage("Post copié dans le presse-papier.");
  }

  if (!isAuthenticated) {
    return (
      <div className="page-shell flex items-center justify-center px-4">
        <div className="panel w-full max-w-sm rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-2">WeeklyTroll · LinkedIn</h1>
          <p className="text-xs text-[var(--text-ash)] mb-4">Authentification admin requise.</p>
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
            WeeklyTroll · LinkedIn Post Builder
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Crée des posts LinkedIn depuis un lien.
          </h1>
          <a
            href="/admin"
            className="ui-subtle-link text-xs w-fit"
          >
            Retour au launcher admin
          </a>
        </header>

        <section className="panel rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
          <form className="flex flex-col gap-3" onSubmit={handleGenerate}>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-zinc-300">Lien source</span>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemple.com/article"
                className="ui-input px-2 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={state === "loading"}
              className="ui-button inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {state === "loading" ? "Génération en cours..." : "Générer le post LinkedIn"}
            </button>
          </form>

          {state === "loading" && (
            <div className="flex flex-col gap-2">
              <span className="inline-flex h-2 w-full overflow-hidden rounded-full bg-emerald-700/50">
                <span className="h-full w-1/4 bg-emerald-300 animate-[progress_1s_ease-in-out_infinite]" />
              </span>
              <p className="text-xs text-[var(--accent-magic)]">
                Analyse du lien + génération IA du post...
              </p>
            </div>
          )}
          {message && (
            <p className={`text-xs ${state === "error" ? "text-red-400" : "text-zinc-300"}`}>
              {message}
            </p>
          )}
        </section>

        <section className="panel rounded-2xl p-5 sm:p-6 flex flex-col gap-3">
          <h2 className="text-sm font-medium">Résultat</h2>
          {sourceTitle && (
            <p className="text-xs text-[var(--text-ash)]">
              Source détectée: <span className="text-[var(--text-parchment)]">{sourceTitle}</span>
            </p>
          )}
          {hook && (
            <p className="text-xs text-emerald-300">
              Hook proposé: {hook}
            </p>
          )}
          <textarea
            value={post}
            onChange={(e) => setPost(e.target.value)}
            rows={12}
            className="ui-input px-2 py-2 text-xs resize-y"
            placeholder="Le post généré apparaîtra ici."
          />
          {hashtags.length > 0 && <p className="text-[11px] text-[var(--text-ash)]">{hashtags.join(" ")}</p>}
          <button
            type="button"
            onClick={copyPost}
            className="ui-button inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium"
          >
            Copier le post
          </button>
        </section>
      </main>
    </div>
  );
}

