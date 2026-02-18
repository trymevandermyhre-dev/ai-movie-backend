const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    return res.json({ error: "Only POST allowed" });
  }

  let body = "";

  req.on("data", chunk => {
    body += chunk.toString();
  });

  req.on("end", async () => {
    try {
      const { message, history = [] } = JSON.parse(body);

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Du er en film-ekspert. Snakk naturlig. Still korte spørsmål for å forstå mood, energi og sjanger. Når du vet nok, anbefal én film og forklar hvorfor.",
          },
          ...history,
          { role: "user", content: message },
        ],
        max_tokens: 200,
      });

      res.statusCode = 200;
      res.json({
        reply: completion.choices[0].message.content,
      });
    } catch (err) {
      res.statusCode = 500;
      res.json({ error: "Server error", details: err.message });
    }
  });
};
