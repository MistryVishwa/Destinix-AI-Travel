import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const bookingData = req.body;

    // Save booking to DB here (future integration)

    res.status(200).json({ success: true, booking: bookingData });
  } catch {
    res.status(500).json({ error: "Booking creation failed" });
  }
}