import { NextRequest } from "next/server";
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
    const body = (await req.json()) as { url?: string };
    const url = (body.url || "").trim();

    if (!isValidHttpUrl(url)) {
      return new Response(
        JSON.stringify({ error: "Lien invalide. Utilise un URL http(s)." }),
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

    const prompt = `Source: ${url}
Titre: ${extracted.title}
Contenu principal:
${extracted.text}

Objectif:
Rédige un post LinkedIn en français, percutant et naturel:
- ouverture qui accroche
- 3 à 5 points clés
- une opinion concise
- CTA final
- 3 hashtags pertinents

Retourne uniquement du JSON:
{"post":"...","hook":"...","hashtags":["#a","#b","#c"]}
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
        max_tokens: 900,
        messages: [
          {
            role: "system",
            content:
              "Tu es un copywriter LinkedIn senior. Tu respectes strictement le format demandé.",
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

    const data = (await groqRes.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const raw = data.choices?.[0]?.message?.content?.trim() || "";

    let parsed: { post?: string; hook?: string; hashtags?: string[] } = {};
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

    const hashtags = parsed.hashtags?.length
      ? parsed.hashtags
      : ["#marketing", "#newsletter", "#linkedin"];
    const post =
      (parsed.post || raw || "").trim() +
      "\n\n" +
      hashtags.join(" ");

    if (!post.trim()) {
      return new Response(
        JSON.stringify({ error: "Aucun post généré." }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        hook: (parsed.hook || "").trim(),
        post,
        hashtags,
        sourceTitle: extracted.title,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: "Erreur lors de la génération du post LinkedIn depuis le lien.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

