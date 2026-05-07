import { NextRequest } from "next/server";
import { addSubscriber } from "../../../lib/db";
import "../../../lib/scheduler";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let email = "";

    if (contentType.includes("application/json")) {
      const body = (await req.json()) as { email?: string };
      email = body.email?.trim() || "";
    } else {
      const form = await req.formData();
      email = String(form.get("email") || "").trim();
    }

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Adresse email invalide." }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    await addSubscriber(email);

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de l'inscription." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

