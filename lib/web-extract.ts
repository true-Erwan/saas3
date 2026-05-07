function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractWebsiteText(url: string): Promise<{
  title: string;
  text: string;
}> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "User-Agent": "WeeklyTrollBot/1.0 (+newsletter automation)",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Impossible de récupérer le site (${res.status}).`);
  }

  const html = await res.text();
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = (titleMatch?.[1] || "Sans titre").trim();
  const text = stripHtml(html).slice(0, 9000);

  if (!text) {
    throw new Error("Le site ne contient pas de texte exploitable.");
  }

  return { title, text };
}

