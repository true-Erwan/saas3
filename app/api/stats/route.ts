import { getSubscribersCount } from "../../../lib/db";
import "../../../lib/scheduler";

export async function GET() {
  try {
    const count = await getSubscribersCount();
    return new Response(
      JSON.stringify({ subscribers: count }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return new Response(
      JSON.stringify({ error: "Erreur lors de la récupération des stats." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}

