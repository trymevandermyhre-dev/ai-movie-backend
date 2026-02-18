import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are CineMood, an AI that recommends movies based on the user's mood. Give 3–5 movie recommendations with a short reason for each.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    // ⬇️ VIKTIG: dette feltet frontend leser
    return res.status(200).json({
      reply: reply,
    });
  } catch (error) {
    console.error("API ERROR:", error);
    return res.status(500).json({
      error: "Failed to generate response",
    });
  }
}
