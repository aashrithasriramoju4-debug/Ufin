const express = require('express');
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'your_groq_api_key_here') {
      return res.json({
        reply: "⚠️ Groq API key is missing. Please add your GROQ_API_KEY to the .env file."
      });
    }

    const systemPrompt = `You are U-FIN Assistant (farm platform AI).
STRICT RULES:
- Short answers
- Use structured format (📦 Product, ⭐ Trust, 💡 Suggestion)
- Mention price, trust, rating
- Detect language automatically (English, Hindi, Telugu)
- Keep it simple and practical.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    res.json({
      reply: chatCompletion.choices[0].message.content.trim(),
    });

  } catch (err) {
    console.error("GROQ ERROR:", err.message);
    res.json({
      reply: "⚠️ AI service issue. Please try again later."
    });
  }
});

module.exports = router;
