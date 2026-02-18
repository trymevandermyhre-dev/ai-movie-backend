import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ✅ CORS – DETTE ER KRITISK
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // ✅ Preflight request (Shopify stopper her uten dette)
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 200,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content:
            "You are CineMood. Recommend EXACTLY 3 movies.\n\nIMPORTANT RULES:\n- Each movie MUST be on ONE single line\n- DO NOT number the list\n- DO NOT use quotes\n- Use EXACTLY this format:\nTitle – short vibe | Where to watch\n\nExample:\nSuperbad – Hilarious teen comedy chaos | Netflix"

        },
        { role: "user", content: message },
      ],
    });

   const raw = completion.choices[0].message.content;

const lines = raw
  .split("\n")
  .map(l => l.trim())
  .filter(l => l.includes("–") && l.includes("|"));


const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

async function getPoster(title) {
  const res = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(title)}`
  );
  const data = await res.json();
  return data.results?.[0]?.poster_path
    ? TMDB_IMG + data.results[0].poster_path
    : null;
}

const movies = await Promise.all(
  lines.slice(0, 3).map(async line => {
    const [titlePart, rest] = line.split("–");
    const [vibe, where] = rest.split("|");

    const title = titlePart.trim();
    const poster = await getPoster(title);

    return {
      title,
      vibe: vibe?.trim() || "",
      where: where?.trim() || "Streaming",
      poster,
    };
  })
);

return res.status(200).json({ movies });


  } catch (error) {
    console.error("OPENAI ERROR:", error);

    // ✅ ALDRI SEND 500 UTEN CORS
    return res.status(200).json({
      reply:
        "I'm getting too many requests right now 😅 Please wait a few seconds and try again.",
    });
  }
}
