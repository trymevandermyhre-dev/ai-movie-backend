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
            "You are CineMood. Recommend 3–4 movies in a light, Netflix-style way. Short vibe sentences only.",
        },
        { role: "user", content: message },
      ],
    });

    return res.status(200).json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("OPENAI ERROR:", error);

    // ✅ ALDRI SEND 500 UTEN CORS
    return res.status(200).json({
      reply:
        "I'm getting too many requests right now 😅 Please wait a few seconds and try again.",
    });
  }
}
