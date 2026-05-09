export default function Home() {
  return (
    <div className="page-shell flex flex-col items-center">
      <main className="w-full max-w-2xl px-6 py-16 flex flex-col gap-10">
        <header className="flex flex-col gap-3 text-center">
          <p className="badge inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-medium">
            WeeklyTroll · Newsletter IA hebdomadaire
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Recevez chaque semaine une newsletter drôle et intelligente.
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-ash)]">
            Une fois par semaine, un résumé sarcastique de l&apos;actu tech et
            business, généré par une IA un peu trop honnête.
          </p>
        </header>

        <section className="panel rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-medium mb-2">
            Inscrivez-vous à la newsletter
          </h2>
          <p className="text-sm text-[var(--text-ash)] mb-4">
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
              className="ui-input flex-1 px-2 py-2.5 text-sm"
            />
            <button
              type="submit"
              className="ui-button inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium"
            >
              S&apos;inscrire
            </button>
          </form>

          <p className="mt-3 text-[11px] text-[var(--text-ash)]">
            Aucun spam, juste une dose hebdomadaire de troll bienveillant. Vous
            pouvez vous désinscrire à tout moment.
          </p>
        </section>

        <section className="text-xs text-[var(--text-ash)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p>
            Admin ?{" "}
            <a
              href="/admin"
              className="ui-subtle-link"
            >
              Accédez au dashboard WeeklyTroll
            </a>
          </p>
        </section>
      </main>
    </div>
  );
}
