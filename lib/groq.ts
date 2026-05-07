const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function generateNewsletterContent(topic: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Tu es WeeklyTroll, une IA qui écrit des newsletters humoristiques hebdomadaires, légères mais pertinentes, en français.",
        },
        {
          role: "user",
          content: `Écris une newsletter hebdomadaire drôle et engageante sur le thème suivant : "${topic}". Utilise un ton léger, quelques blagues, et termine par un call-to-action.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Groq API error: ${response.status} - ${text}`);
  }

  const data = (await response.json()) as {
    choices: { message: { content: string } }[];
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq API returned no content");
  }

  return content.trim();
}

