import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API endpoint for AI Skincare Routine Advisor (Bengali output)
app.post("/api/ai-advisor", async (req, res) => {
  try {
    const { skinType, concerns, age } = req.body;

    const prompt = `You are an expert dermatological beauty advisor for GlowBoost (গ্লোবুস্ট), a premium 100% authentic beauty brand in Bangladesh.
A customer has provided the following skin profile:
- Skin Type: ${skinType || "মিশ্র ত্বক (Combination)"}
- Main Concerns: ${concerns || "ব্রণের দাগ ও নিস্তেজ ভাব"}
- Age Group: ${age || "২০-২৯ বছর"}

Recommend a customized 3-step skincare routine (Morning and Night) using authentic ingredients (like Vitamin C, Niacinamide, Hyaluronic Acid, SPF 50 Mineral Sunscreen, Gentle Cleanser).

IMPORTANT: ALL TEXT IN THE JSON (skinAnalysis, productName, description, proTip) MUST BE WRITTEN IN NATURAL, POLITE, PROFESSIONAL BENGALI (বাংলা ভাষা).
Provide the response in clean JSON format with the following structure:
{
  "skinAnalysis": "ত্বকের ধরন ও সমস্যা নিয়ে বিশেষজ্ঞ বিশ্লেষণ (২-৩ বাক্য বাংলায়)",
  "morningRoutine": [
    { "step": 1, "productName": "প্রোডাক্টের নাম (বাংলায়)", "description": "ব্যবহারের নিয়ম ও উপকারিতা (বাংলায়)" },
    { "step": 2, "productName": "প্রোডাক্টের নাম (বাংলায়)", "description": "ব্যবহারের নিয়ম ও উপকারিতা (বাংলায়)" },
    { "step": 3, "productName": "প্রোডাক্টের নাম (বাংলায়)", "description": "ব্যবহারের নিয়ম ও উপকারিতা (বাংলায়)" }
  ],
  "nightRoutine": [
    { "step": 1, "productName": "প্রোডাক্টের নাম (বাংলায়)", "description": "ব্যবহারের নিয়ম ও উপকারিতা (বাংলায়)" },
    { "step": 2, "productName": "প্রোডাক্টের নাম (বাংলায়)", "description": "ব্যবহারের নিয়ম ও উপকারিতা (বাংলায়)" }
  ],
  "proTip": "বাংলাদেশের আবহাওয়ায় ত্বকের উজ্জ্বলতার জন্য বিশেষজ্ঞ পরামর্শ (বাংলায়)"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("AI Advisor error:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI skincare advice" });
  }
});

// Vite middleware in dev or static files in production
if (process.env.NODE_ENV !== "production") {
  const { createServer: createViteServer } = await import("vite");
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, "dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`GlowBoost server running on http://localhost:${PORT}`);
});
