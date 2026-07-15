import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

dotenv.config();

// Reuses the same Gmail/SMTP transporter configuration and env vars as the
// rest of the app (server.ts / server/collaboration/services/mailService.ts).
// When SMTP_USER/SMTP_PASS aren't set, this runs in "Email Demo Mode" — the
// same safe no-op fallback used elsewhere — instead of throwing.
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

// A dedicated Pool/PrismaClient is created here (rather than importing the
// one from server.ts) so this job module can be unit-tested / invoked in
// isolation, matching the pattern already used by server/routes/userRoutes.ts.
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function sendPriceDropEmail(params: {
  toEmail: string;
  userName?: string | null;
  packageTitle: string;
  destination: string;
  targetPrice: number;
  currentPrice: number;
  currency: string;
}): Promise<void> {
  const { toEmail, userName, packageTitle, destination, targetPrice, currentPrice, currency } = params;

  if (!smtpUser || !smtpPass) {
    console.log(
      `[Email Demo Mode] Skipping price-drop email to ${toEmail} for "${packageTitle}" (target: ${targetPrice}, current: ${currentPrice}).`
    );
    return;
  }

  await transporter.sendMail({
    from: `"Destinix Travel" <${smtpUser}>`,
    to: toEmail,
    subject: `📉 Price Drop Alert: ${packageTitle} is now within your budget!`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="color: #4f46e5; text-align: center;">Good News, ${userName || "Traveler"}! 🎉</h2>
        <p>A package you're watching has dropped to your target price.</p>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Package:</strong> ${packageTitle}</p>
          <p><strong>Destination:</strong> ${destination}</p>
          <p><strong>Your Target Price:</strong> ${currency} ${targetPrice.toLocaleString()}</p>
          <p><strong>Current Price:</strong> ${currency} ${currentPrice.toLocaleString()}</p>
        </div>
        <p>Book now before the price changes again!</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2026 Destinix Travel. All rights reserved.</p>
      </div>
    `,
  });
}

/**
 * Loads every un-notified PriceAlert, compares the alert's target price
 * against the package's current price, and emails the user (via the
 * existing Nodemailer/SMTP setup) for any alert whose target has been met
 * or beaten. Notified alerts are stamped with `notifiedAt` so they are not
 * re-sent on the next run.
 *
 * A failure while processing one alert is caught and logged so it can never
 * abort the rest of the batch (acceptance criterion: job failures are
 * logged, not silently swallowed).
 */
export async function checkPriceAlerts(): Promise<void> {
  console.log(`[price-alert-job] Run started at ${new Date().toISOString()}`);

  let alerts;
  try {
    alerts = await prisma.priceAlert.findMany({
      where: { notifiedAt: null },
      include: { user: true, package: true },
    });
  } catch (error: any) {
    // Most likely cause in this environment: no DATABASE_URL / unreachable DB.
    // Log loudly and bail out for this run instead of crashing the process.
    console.error("[price-alert-job] Failed to load price alerts from the database:", error?.message || error);
    return;
  }

  console.log(`[price-alert-job] Evaluating ${alerts.length} un-notified alert(s).`);

  let notifiedCount = 0;
  let errorCount = 0;

  for (const alert of alerts) {
    try {
      const pkg = alert.package;
      if (!pkg) {
        console.error(`[price-alert-job] Alert ${alert.id} references a missing package (${alert.packageId}); skipping.`);
        continue;
      }

      if (pkg.price > alert.targetPrice) {
        // Target not yet met, leave the alert pending for the next run.
        continue;
      }

      await sendPriceDropEmail({
        toEmail: alert.user.email,
        userName: alert.user.firstName || alert.user.name,
        packageTitle: pkg.title,
        destination: pkg.destination,
        targetPrice: alert.targetPrice,
        currentPrice: pkg.price,
        currency: pkg.currency,
      });

      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: { notifiedAt: new Date() },
      });

      notifiedCount++;
    } catch (error: any) {
      // Isolate the failure to this single alert so the rest of the batch
      // still gets processed.
      errorCount++;
      console.error(`[price-alert-job] Failed to process alert ${alert.id} for user ${alert.userId}:`, error?.message || error);
    }
  }

  console.log(`[price-alert-job] Run complete. Notified: ${notifiedCount}, failed: ${errorCount}, total evaluated: ${alerts.length}.`);
}
