import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { paymentId, orderId, signature } = req.body;

    // Add Razorpay signature verification here

    res.status(200).json({ verified: true });
  } catch {
    res.status(500).json({ error: "Payment verification failed" });
  }
}