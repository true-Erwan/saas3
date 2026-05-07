export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center">
      <main className="w-full max-w-2xl px-6 py-16 flex flex-col gap-10">
        <header className="flex flex-col gap-3 text-center">
          <p className="inline-flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 px-4 py-1 text-xs font-medium text-zinc-300">
            WeeklyTroll · Newsletter IA hebdomadaire
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Recevez chaque semaine une newsletter drôle et intelligente.
          </h1>
          <p className="text-sm sm:text-base text-zinc-400">
            Une fois par semaine, un résumé sarcastique de l&apos;actu tech et
            business, généré par une IA un peu trop honnête.
          </p>
        </header>

        <section className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 shadow-lg shadow-black/40">
          <h2 className="text-lg font-medium mb-2">
            Inscrivez-vous à la newsletter
          </h2>
          <p className="text-sm text-zinc-400 mb-4">
            Laissez-nous juste votre email, et WeeklyTroll s&apos;occupe du
            reste.
          </p>

          <form
            className="flex flex-col sm:flex-row gap-3"
            action="/api/subscribe"
            method="POST"
          >
            <input
              type="email"
              name="email"
              required
              placeholder="vous@exemple.com"
              className="flex-1 rounded-full border border-zinc-700 bg-zinc-950/60 px-4 py-2.5 text-sm outline-none ring-0 focus:border-emerald-400 transition-colors"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-emerald-950 shadow-md shadow-emerald-500/40 hover:bg-emerald-400 transition-colors"
            >
              S&apos;inscrire
            </button>
          </form>

          <p className="mt-3 text-[11px] text-zinc-500">
            Aucun spam, juste une dose hebdomadaire de troll bienveillant. Vous
            pouvez vous désinscrire à tout moment.
          </p>
        </section>

        <section className="text-xs text-zinc-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>
            Admin ?{" "}
            <a
              href="/admin"
              className="underline underline-offset-4 text-zinc-300 hover:text-emerald-300"
            >
              Accédez au dashboard WeeklyTroll
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
