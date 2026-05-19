require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const path = require("path");

const app = express();
app.use(express.json({ limit: "20mb" }));
app.use(express.static(path.join(__dirname, "public")));

const API_KEY     = process.env.OPENROUTER_API_KEY;
const MODEL        = process.env.MODEL        || "deepseek/deepseek-v4-flash:free";
const VISION_MODEL = process.env.VISION_MODEL || "google/gemini-flash-1.5";

if (!API_KEY) {
  console.error("❌ OPENROUTER_API_KEY is not set! Add it to Render environment variables.");
}

const PERSONALITIES = {
  default: "You are Akane MD, a helpful and friendly assistant created by Akane. Always respond in English only. Never say you are DeepSeek or any other AI — you are Akane MD.",
  coder:   "You are Akane MD in Coder Mode. You are an expert programmer. Give code examples, explain bugs, and help with JavaScript, Python, Node.js, and Baileys.js. Always respond in English only. Never say you are DeepSeek.",
  tutor:   "You are Akane MD in Tutor Mode. Explain everything simply like teaching a beginner. Use examples and analogies. Always respond in English only. Never say you are DeepSeek.",
  friend:  "You are Akane MD in Friend Mode. Be casual, funny, and use slang. Talk like a close friend. Always respond in English only. Never say you are DeepSeek.",
};

// ── Text chat ──
app.post("/api/chat", async (req, res) => {
  const { messages, personality = "default" } = req.body;
  if (!messages || !Array.isArray(messages))
    return res.status(400).json({ error: "Invalid messages" });

  const systemPrompt = PERSONALITIES[personality] || PERSONALITIES.default;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "https://akanemd.onrender.com",
        "X-Title": "Akane MD"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt }, ...messages]
      })
    });

    const data = await response.json();
    if (!data.choices?.[0]) {
      console.error("OpenRouter API Error:", JSON.stringify(data, null, 2));
      const errorMsg = data.error?.message || JSON.stringify(data);
      return res.status(500).json({ error: `AI error: ${errorMsg}` });
    }
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("Chat fetch error:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

// ── Vision / image analysis ──
app.post("/api/vision", async (req, res) => {
  const { imageBase64, mimeType = "image/jpeg", prompt = "Describe this image in detail.", personality = "default" } = req.body;
  if (!imageBase64)
    return res.status(400).json({ error: "No image provided" });

  const systemPrompt = PERSONALITIES[personality] || PERSONALITIES.default;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "https://akanemd.onrender.com",
        "X-Title": "Akane MD"
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
              { type: "text", text: prompt }
            ]
          }
        ]
      })
    });

    const data = await response.json();
    if (!data.choices?.[0]) {
      console.error("Vision API Error:", JSON.stringify(data, null, 2));
      const errorMsg = data.error?.message || JSON.stringify(data);
      return res.status(500).json({ error: `Vision error: ${errorMsg}` });
    }
    res.json({ reply: data.choices[0].message.content });
  } catch (err) {
    console.error("Vision fetch error:", err.message);
    res.status(500).json({ error: "Server error. Please try again." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Akane MD running on port ${PORT} | Model: ${MODEL}`));
