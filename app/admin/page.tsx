"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export default function AdminPage() {
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [subscribersCount, setSubscribersCount] = useState<number | null>(null);
  const [subscriberEmail, setSubscriberEmail] = useState("");
  const [subMessage, setSubMessage] = useState<string | null>(null);

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

  async function handleAddSubscriber(e: React.FormEvent) {
    e.preventDefault();
    setSubMessage(null);
    if (!subscriberEmail.trim()) {
      setSubMessage("Entre un email valide.");
      return;
    }

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscriberEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubMessage(data.error || "Erreur lors de l'ajout de l'email.");
        return;
      }
      setSubscriberEmail("");
      setSubMessage("Email ajouté aux abonnés.");
      setSubscribersCount((prev) => (typeof prev === "number" ? prev + 1 : prev));
    } catch {
      setSubMessage("Erreur réseau.");
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="page-shell flex items-center justify-center px-4">
        <div className="panel w-full max-w-sm rounded-2xl p-6">
          <h1 className="text-xl font-semibold mb-2">WeeklyTroll · Admin</h1>
          <p className="text-xs text-[var(--text-ash)] mb-4">
            Cette zone est réservée aux trolls professionnels.
          </p>
          <form className="flex flex-col gap-3" onSubmit={handleLogin}>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Mot de passe admin"
              className="ui-input px-2 py-2 text-sm"
            />
            {authError && (
              <p className="text-xs text-red-400">{authError}</p>
            )}
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
      <main className="w-full max-w-5xl px-6 py-10 flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="badge inline-flex items-center rounded-full px-4 py-1 text-[11px] font-medium w-fit">
            WeeklyTroll · Launcher Admin
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Lanceur de création
          </h1>
          <p className="text-xs text-[var(--text-ash)]">
            Deux espaces : créer la newsletter (emails + News Later) et générer
            des posts LinkedIn depuis un lien.
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="panel rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Zone Newsletter</h2>
              <span className="text-[11px] text-[var(--text-ash)]">
                Abonnés: {subscribersCount ?? "—"}
              </span>
            </div>
            <p className="text-xs text-[var(--text-ash)]">
              Ajoute rapidement un email, puis ouvre la page News Later pour
              générer/programmer ta newsletter.
            </p>
            <form className="flex flex-col gap-3" onSubmit={handleAddSubscriber}>
              <input
                type="email"
                value={subscriberEmail}
                onChange={(e) => setSubscriberEmail(e.target.value)}
                placeholder="nouvel-abonne@email.com"
                className="ui-input px-2 py-2 text-sm"
              />
              <button
                type="submit"
                className="ui-button inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium"
              >
                Ajouter l&apos;email
              </button>
              {subMessage && <p className="text-xs text-zinc-300">{subMessage}</p>}
            </form>
            <a
              href="/admin/news-later"
              className="ui-button inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium"
            >
              Ouvrir création News Later
            </a>
          </div>

          <div className="panel rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
            <h2 className="text-sm font-medium">Zone Posts LinkedIn</h2>
            <p className="text-xs text-[var(--text-ash)]">
              Colle un lien d&apos;article/site et génère automatiquement un post
              LinkedIn prêt à publier grâce à Groq.
            </p>
            <a
              href="/admin/linkedin-posts"
              className="ui-button inline-flex items-center justify-center rounded-full px-4 py-2 text-xs font-medium"
            >
              Ouvrir générateur LinkedIn
            </a>
            <p className="text-[11px] text-[var(--text-ash)]">
              Même clé API
              {" "}
              <code className="px-1 py-0.5 rounded bg-zinc-800 text-[10px]">
                GROQ_API_KEY
              </code>
              {" "}
              utilisée.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

