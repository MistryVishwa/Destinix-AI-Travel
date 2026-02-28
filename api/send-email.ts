import type { VercelRequest, VercelResponse } from "@vercel/node";
import { sendEmail } from "../lib/email";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { email, content } = req.body;
    await sendEmail(email, "Your Travel Plan", content);
    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: "Email failed" });
  }
}