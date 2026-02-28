import nodemailer from "nodemailer";

export default async function handler(req, res) {
  try {
    const {
      email,
      name,
      packageTitle,
      destination,
      vehicle,
      travelDate,
      amount,
      bookingId,
      paymentId,
      pdfBase64
    } = req.body;

    if (!email || !pdfBase64) {
      return res.status(400).json({ error: "Missing email or PDF" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Destinix Travel" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🎉 Booking Confirmed - Destinix",
      html: `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Booking Confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
<tr>
<td align="center">

<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;">

<!-- HEADER -->
<tr>
<td align="center" style="padding:50px 30px;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;">
<h2 style="margin:0;font-size:20px;font-weight:500;">✈️ Destinix Travel</h2>
<p style="margin:15px 0 0 0;font-size:28px;font-weight:600;">Booking Confirmed 🎉</p>
</td>
</tr>

<!-- GREETING -->
<tr>
<td style="padding:40px 40px 10px 40px;">
<p style="font-size:18px;margin:0 0 15px 0;"><strong>Hi ${name},</strong></p>
<p style="color:#475569;font-size:15px;line-height:1.6;margin:0;">
Thank you for booking with Destinix Travel. Your trip has been successfully confirmed. Your adventure awaits!
</p>
</td>
</tr>

<!-- BOOKING DETAILS -->
<tr>
<td style="padding:30px 40px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
<tr>
<td style="padding:10px 0;font-size:14px;color:#64748b;">Package</td>
<td align="right" style="padding:10px 0;font-size:14px;font-weight:600;color:#0f172a;">${packageTitle}</td>
</tr>
<tr>
<td style="padding:10px 0;font-size:14px;color:#64748b;">Destination</td>
<td align="right" style="padding:10px 0;font-size:14px;font-weight:600;color:#0f172a;">${destination}</td>
</tr>
<tr>
<td style="padding:10px 0;font-size:14px;color:#64748b;">Vehicle</td>
<td align="right" style="padding:10px 0;font-size:14px;font-weight:600;color:#0f172a;">${vehicle}</td>
</tr>
<tr>
<td style="padding:10px 0;font-size:14px;color:#64748b;">Travel Date</td>
<td align="right" style="padding:10px 0;font-size:14px;font-weight:600;color:#0f172a;">${travelDate}</td>
</tr>
<tr>
<td style="padding:10px 0;font-size:14px;color:#64748b;">Amount Paid</td>
<td align="right" style="padding:10px 0;font-size:16px;font-weight:700;color:#4f46e5;">₹${amount}</td>
</tr>
<tr>
<td style="padding:10px 0;font-size:14px;color:#64748b;">Booking ID</td>
<td align="right" style="padding:10px 0;font-size:14px;font-weight:600;color:#0f172a;">${bookingId}</td>
</tr>
<tr>
<td style="padding:10px 0;font-size:14px;color:#64748b;">Payment ID</td>
<td align="right" style="padding:10px 0;font-size:14px;font-weight:600;color:#0f172a;">${paymentId}</td>
</tr>
</table>
</td>
</tr>

<!-- ATTACHMENT NOTICE -->
<tr>
<td style="padding:0 40px 40px 40px;">
<p style="font-size:14px;color:#475569;margin:0;">
📎 Your official booking invoice is attached as a PDF document.
</p>
</td>
</tr>

<!-- FOOTER -->
<tr>
<td align="center" style="padding:40px;background:#0f172a;color:#ffffff;">
<p style="margin:0;font-size:18px;">We wish you a wonderful journey ✈️</p>
<p style="margin:15px 0 0 0;font-size:14px;color:#94a3b8;">
Need assistance? support@destinixtravel.com
</p>
<p style="margin:15px 0 0 0;font-size:12px;color:#64748b;">
© 2026 Destinix Travel. All rights reserved.
</p>
</td>
</tr>

</table>

</td>
</tr>
</table>

</body>
</html>
      `,
      attachments: [
        {
          filename: `Destinix_Receipt_${paymentId}.pdf`,
          content: pdfBase64,
          encoding: "base64",
        },
      ],
    });

    res.status(200).json({ success: true });

  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).json({ error: "Email failed", details: error.message });
  }
}