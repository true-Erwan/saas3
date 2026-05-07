import { NextRequest } from "next/server";
import { createNewsletter } from "../../../../lib/db";
import "../../../../lib/scheduler";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      subject?: string;
      topic?: string;
      content?: string;
      scheduledAt?: string;
    };

    const subject = body.subject?.trim();
    const topic = body.topic?.trim();
    const content = body.content?.trim();
    const scheduledAt = body.scheduledAt;

    if (!subject || !topic || !content || !scheduledAt) {
      return new Response(
        JSON.stringify({
          error:
            "Sujet, thème, contenu et date/heure de planification sont requis.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) {
      return new Response(
        JSON.stringify({ error: "Date de planification invalide." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const newsletter = await createNewsletter({
      subject,
      topic,
      content,
      scheduledAt: date.toISOString(),
    });

    return new Response(
      JSON.stringify({ ok: true, newsletter }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({
        error: "Erreur lors de la planification de la newsletter.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

