import { NextRequest } from "next/server";
import { createNewsletter } from "../../../../lib/db";
import "../../../../lib/scheduler";
import { extractWebsiteText } from "../../../../lib/web-extract";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

function isValidHttpUrl(input: string): boolean {
  try {
    const u = new URL(input);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      url?: string;
      scheduledAt?: string;
    };

    const url = body.url?.trim() || "";
    if (!isValidHttpUrl(url)) {
      return new Response(
        JSON.stringify({ error: "Lien invalide. Utilisez un URL http(s)." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY n'est pas configurée." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const extracted = await extractWebsiteText(url);
    const scheduledAt = body.scheduledAt
      ? new Date(body.scheduledAt)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    if (Number.isNaN(scheduledAt.getTime())) {
      return new Response(
        JSON.stringify({ error: "Date de planification invalide." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const prompt = `URL source: ${url}
Titre de la page: ${extracted.title}

Contenu principal extrait:
${extracted.text}

Tâche:
1) Rédige une newsletter française "WeeklyTroll" drôle et engageante basée sur cette page.
2) Donne une synthèse claire + angle troll léger + conclusion CTA.
3) Retourne strictement du JSON avec ce format:
{"subject":"...","topic":"...","content":"..."}
`;

    const groqRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 1200,
        messages: [
          {
            role: "system",
            content:
              "Tu es un assistant rédactionnel. Tu suis strictement le format de sortie demandé.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!groqRes.ok) {
      const msg = await groqRes.text();
      return new Response(
        JSON.stringify({ error: `Groq error: ${groqRes.status} - ${msg}` }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const groqData = (await groqRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = groqData.choices?.[0]?.message?.content?.trim() || "";

    let parsed: { subject?: string; topic?: string; content?: string } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();
      parsed = JSON.parse(cleaned);
    }

    const subject = (parsed.subject || `WeeklyTroll · ${extracted.title}`).trim();
    const topic = (parsed.topic || extracted.title).trim();
    const content = (parsed.content || raw).trim();

    if (!content) {
      return new Response(
        JSON.stringify({ error: "Contenu IA vide." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    const newsletter = await createNewsletter({
      subject,
      topic,
      content,
      scheduledAt: scheduledAt.toISOString(),
    });

    return new Response(
      JSON.stringify({ ok: true, newsletter }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error:
          "Erreur lors de la génération automatique depuis le lien du site.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

