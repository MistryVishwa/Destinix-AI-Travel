import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiModel } from "../lib/gemini";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { message } = req.body;
    const model = getGeminiModel();
    const result = await model.generateContent(message);

    res.status(200).json({ reply: result.response.text() });
  } catch {
    res.status(500).json({ error: "Chatbot failed" });
  }
}
