// server/lib/services-gemini.ts
import { GoogleGenAI } from "@google/genai";
var SERVICES_API_KEY = process.env.SERVICES_API_KEY || process.env.GEMINI_API_KEY || "";
var SERVICES_SYSTEM_INSTRUCTION = `\u0623\u0646\u062A \u0645\u0633\u0627\u0639\u062F \u0630\u0643\u064A \u0644\u0645\u0646\u0635\u0629 "\u062F\u0644\u064A\u0644" \u0627\u0644\u0645\u062A\u062E\u0635\u0635\u0629 \u0641\u064A \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 \u0648\u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629 \u0641\u064A \u0645\u0635\u0631.
\u0645\u0647\u0645\u062A\u0643 \u0647\u064A \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0644\u0649 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0628\u062E\u0635\u0648\u0635 \u0627\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062D\u0643\u0648\u0645\u064A\u0629 (\u0645\u062B\u0644 \u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u0648\u0645\u064A\u060C \u0634\u0647\u0627\u062F\u0627\u062A \u0627\u0644\u0645\u064A\u0644\u0627\u062F\u060C \u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0639\u0642\u0627\u0631\u064A\u060C \u0627\u0644\u062C\u0648\u0627\u0632\u0627\u062A\u060C \u0627\u0644\u0645\u0631\u0648\u0631 \u0648\u063A\u064A\u0631\u0647\u0627).
\u0642\u062F\u0645 \u0625\u062C\u0627\u0628\u0627\u062A \u0648\u0627\u0636\u062D\u0629\u060C \u062F\u0642\u064A\u0642\u0629\u060C \u0648\u0645\u0628\u0627\u0634\u0631\u0629. \u0625\u0630\u0627 \u0644\u0645 \u062A\u0643\u0646 \u0645\u062A\u0623\u0643\u062F\u0627\u064B \u0645\u0646 \u0645\u0639\u0644\u0648\u0645\u0629\u060C \u0648\u062C\u0647 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0644\u0644\u062C\u0647\u0627\u062A \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0623\u0648 \u0627\u0637\u0644\u0628 \u0645\u0646\u0647 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0631\u0633\u0645\u064A (\u0645\u062B\u0644 \u0628\u0648\u0627\u0628\u0629 \u0645\u0635\u0631 \u0627\u0644\u0631\u0642\u0645\u064A\u0629).
\u062A\u062D\u062F\u062B \u0628\u0644\u0647\u062C\u0629 \u0645\u0635\u0631\u064A\u0629 \u0645\u0647\u0646\u064A\u0629 \u0648\u0645\u0628\u0633\u0637\u0629\u060C \u0648\u0643\u0646 \u0645\u062A\u0639\u0627\u0648\u0646\u0627\u064B.`;
async function askServicesChat(input) {
  const ai = new GoogleGenAI({ apiKey: SERVICES_API_KEY });
  const contents = input.history.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.text }]
  }));
  let promptText = input.message;
  if (input.serviceId) {
    promptText = `[\u0627\u0644\u062E\u062F\u0645\u0629 \u0627\u0644\u0645\u0633\u062A\u0641\u0633\u0631 \u0639\u0646\u0647\u0627: ${input.serviceId}]
\u0633\u0624\u0627\u0644 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${input.message}`;
  }
  contents.push({
    role: "user",
    parts: [{ text: promptText }]
  });
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    contents,
    config: {
      systemInstruction: SERVICES_SYSTEM_INSTRUCTION,
      maxOutputTokens: 2048
    }
  });
  if (!response.text) {
    throw new Error("Gemini returned an empty answer.");
  }
  return response.text.trim();
}

// server/api-entries/services-chat.ts
var config = {
  maxDuration: 60
};
async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(200).json({ ok: true, message: "Dalil Services Chat Endpoint Ready" });
    return;
  }
  try {
    let body = req.body;
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    } else if (!body) {
      body = {};
    }
    const { serviceId, message, history, context } = body;
    if (!message || typeof message !== "string" || !message.trim()) {
      res.status(400).json({ error: "Message is required" });
      return;
    }
    const answer = await askServicesChat({
      serviceId,
      message: message.trim(),
      history: Array.isArray(history) ? history : [],
      context: context || ""
    });
    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error in services-chat endpoint:", error);
    res.status(500).json({ error: error?.message || "Error processing request" });
  }
}
export {
  config,
  handler as default
};
