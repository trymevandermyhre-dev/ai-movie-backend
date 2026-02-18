import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
      model: "gpt-3.5-turbo", // ← VIKTIG ENDRING
      messages: [
        {
          role: "system",
         content:
"You are CineMood. Recommend movies in a very light, simple way. Always return 3–4 movies. For each movie, use this format:\n\nTitle – short vibe sentence (max 12 words).\n\nKeep it fun, Netflix-style. No long explanations."
.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("OPENAI ERROR:", error);
    return res.status(500).json({
      error: "OpenAI request failed",
      details: error.message,
    });
  }
}
