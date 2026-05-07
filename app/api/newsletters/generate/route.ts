import { NextRequest } from "next/server";
import { generateNewsletterContent } from "../../../../lib/groq";
import "../../../../lib/scheduler";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { topic?: string };
    const topic = body.topic?.trim();

    if (!topic) {
      return new Response(
        JSON.stringify({ error: "Le thème de la semaine est requis." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const content = await generateNewsletterContent(topic);

    return new Response(
      JSON.stringify({ content }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de la génération avec l'IA." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

