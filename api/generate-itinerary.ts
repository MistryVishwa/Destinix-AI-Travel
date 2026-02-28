import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getGeminiModel } from "../lib/gemini";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { prompt } = req.body;
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);

    res.status(200).json({ text: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: "AI generation failed" });
  }
}