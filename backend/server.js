import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

import { systemPrompt } from "./systemPrompt.js";
import { knowledgeBase } from "./knowledgeBase.js";
import { companyInfo } from "./companyInfo.js";

const app = express();
app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

/* Intent keywords */
const internalInfoKeywords = [
  "owner",
  "founder",
  "ceo",
  "who owns",
  "company details",
  "about the company",
  "who started"
];

const blockedKeywords = [
  "payment",
  "card",
  "checkout",
  "refund status",
  "order number"
];

const fallbackReply = `
I want to make sure you get accurate information.

You can find verified details here:
- About Us: https://example.com/about
- Help & Support: https://example.com/help
`;

app.post("/chat", async (req, res) => {
  const userMessage = req.body.message || "";
  const lowerMsg = userMessage.toLowerCase();

  /* Block unsafe topics */
  if (blockedKeywords.some(k => lowerMsg.includes(k))) {
    return res.json({
      reply:
        "I can provide general guidance only. Please visit the Help & Support section for this request:\nhttps://example.com/help"
    });
  }

  /* Company / founder info (explicitly allowed now) */
  if (internalInfoKeywords.some(k => lowerMsg.includes(k))) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `
${systemPrompt}

Company information:
${companyInfo}

User question:
${userMessage}
`
      });

      return res.json({
        reply: response.text || companyInfo
      });

    } catch {
      return res.json({ reply: companyInfo });
    }
  }

  /* General support queries */
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
${systemPrompt}

Website content:
${knowledgeBase}

User question:
${userMessage}
`
    });

    return res.json({
      reply: response.text || fallbackReply
    });

  } catch {
    return res.json({ reply: fallbackReply });
  }
});

app.listen(3000, () => {
  console.log("Chatbot backend running on http://localhost:3000");
});
