import express from "express";
import { createServer as createViteServer } from "vite";
import Razorpay from "razorpay";
import crypto from "crypto";
import cors from "cors";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { convertToINR } from "./services/currencyService";

dotenv.config();

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
});

// In-memory OTP storage (for production, use Redis or a database)
const otpStore: Record<string, { otp: string; expires: number }> = {};

// Nodemailer transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

// Verify transporter connection on startup
const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER;
const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

if (smtpUser && smtpPass) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("SMTP Connection Error:", error.message);
    } else {
      console.log("SMTP Server is ready to take our messages");
    }
  });
} else {
  console.log("Running in Email Demo Mode. Set SMTP_USER and SMTP_PASS for real emails.");
}

// API Routes
app.post("/api/bookings", async (req, res) => {
  const bookingData = req.body;
  if (!bookingData.firstName || !bookingData.lastName || !bookingData.email) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  
  try {
    const user = await prisma.user.upsert({
      where: { email: bookingData.email },
      update: {
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        phone: bookingData.phone,
        address: bookingData.address,
        city: bookingData.city,
        zipCode: bookingData.zipCode,
      },
      create: {
        email: bookingData.email,
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        phone: bookingData.phone,
        address: bookingData.address,
        city: bookingData.city,
        zipCode: bookingData.zipCode,
      }
    });

    const newBooking = await prisma.booking.create({
      data: {
        userId: user.id,
        packageId: bookingData.packageId,
        totalAmount: bookingData.totalAmount || 0,
        currency: bookingData.currency || 'INR',
        numTravelers: bookingData.numTravelers || 1,
        selectedVehicle: bookingData.selectedVehicle,
        status: 'Pending',
        flight: bookingData.flight ? {
          create: {
            airline: bookingData.flight.airline || "TBD",
            flightNumber: bookingData.flight.flightNumber || "TBD",
            price: bookingData.flight.price || 0,
            departureTime: bookingData.flight.departureDate ? new Date(bookingData.flight.departureDate) : null,
            arrivalTime: bookingData.flight.returnDate ? new Date(bookingData.flight.returnDate) : null,
          }
        } : undefined,
        hotel: bookingData.hotel ? {
          create: {
            hotelName: bookingData.hotel.name || "TBD",
            price: bookingData.hotel.price || 0,
            roomType: bookingData.hotel.roomType || null,
            checkIn: bookingData.hotel.checkIn ? new Date(bookingData.hotel.checkIn) : null,
            checkOut: bookingData.hotel.checkOut ? new Date(bookingData.hotel.checkOut) : null,
          }
        } : undefined,
        addons: bookingData.addons && Array.isArray(bookingData.addons) ? {
          create: bookingData.addons.map((a: any) => ({
            addonName: typeof a === 'string' ? a : (a.name || "Unknown Addon"),
            price: typeof a === 'string' ? 0 : (a.price || 0)
          }))
        } : undefined,
      }
    });
    res.json({ success: true, message: "Booking details saved successfully", bookingId: newBooking.id });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Failed to save booking" });
  }
});

app.post("/api/update-booking", async (req, res) => {
  const { id, updates } = req.body;
  if (!id || !updates) return res.status(400).json({ error: "ID and updates are required" });

  try {
    await prisma.booking.update({
      where: { id },
      data: updates
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(404).json({ error: "Booking not found or update failed" });
  }
});

app.post("/api/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

  const normalizedEmail = email.toLowerCase();
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[normalizedEmail] = {
    otp,
    expires: Date.now() + 10 * 60 * 1000, // 10 minutes
  };

  try {
    const isConfigured = !!(process.env.SMTP_USER && process.env.SMTP_PASS);
    
    if (isConfigured) {
      console.log(`Attempting to send real OTP email to ${email} using Gmail SMTP...`);
      await transporter.sendMail({
        from: `"Destinix Travel" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Your Destinix E-mail Verification Code",
        text: `Your OTP for Destinix Travel booking is: ${otp}. It expires in 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #4f46e5; text-align: center;">Verify Your Booking</h2>
            <p>Hello,</p>
            <p>Your E-mail verification code for Destinix Travel is:</p>
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; margin: 30px 0; text-align: center; background: #f8fafc; padding: 20px; border-radius: 8px;">
              ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2026 Destinix Travel. All rights reserved.</p>
          </div>
        `,
      });
      console.log(`OTP successfully sent to ${email}`);
      
      res.json({ 
        success: true, 
        message: "OTP sent successfully to your email",
        isDemo: false
      });
    } else {
      console.log(`[ERROR] SMTP credentials not configured. Cannot send OTP to ${email}.`);
      res.status(500).json({ 
        error: "Email service not configured. Please set SMTP_USER and SMTP_PASS environment variables.",
        isDemo: true,
        otp: otp // Still return for debugging in logs if needed, but UI shouldn't show it
      });
    }
  } catch (error: any) {
    console.error("CRITICAL: Failed to send OTP email:", error.message);
    res.status(500).json({ 
      error: "Failed to send OTP email. Please check server configuration.",
      details: error.message 
    });
  }
});

app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

  const normalizedEmail = email.toLowerCase();
  const stored = otpStore[normalizedEmail];

  console.log(`Verifying OTP for ${normalizedEmail}. Entered: ${otp}, Stored: ${stored?.otp}`);

  if (!stored) {
    return res.status(400).json({ error: "No OTP found for this email. Please request a new one." });
  }

  if (Date.now() > stored.expires) {
    delete otpStore[normalizedEmail];
    return res.status(400).json({ error: "OTP has expired. Please request a new one." });
  }

  if (stored.otp === otp) {
    delete otpStore[normalizedEmail];
    console.log(`OTP verified successfully for ${normalizedEmail}`);
    res.json({ success: true, message: "OTP verified successfully" });
  } else {
    console.log(`Invalid OTP entered for ${normalizedEmail}`);
    res.status(400).json({ error: "Invalid verification code. Please check and try again." });
  }
});

app.get("/api/my-bookings", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const userBookings = await prisma.booking.findMany({
      where: { user: { email: { equals: email as string, mode: 'insensitive' } } },
      include: {
        user: true,
        package: true,
        flight: true,
        hotel: true,
        addons: true
      }
    });

    const mappedBookings = userBookings.map(b => ({
      ...b,
      email: b.user.email,
      firstName: b.user.firstName,
      lastName: b.user.lastName,
      packageTitle: b.package.title,
      packageImage: b.package.image
    }));
    
    res.json(mappedBookings);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

app.post("/api/send-confirmation", async (req, res) => {
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

  try {
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    
    if (!user) {
      console.log("Email skip: No credentials configured");
      return res.json({ success: true, message: "Email skipped (no config)" });
    }

    const attachments = [];
    if (pdfBase64) {
      attachments.push({
        filename: `Destinix_Receipt_${paymentId || bookingId}.pdf`,
        content: pdfBase64.split("base64,")[1] || pdfBase64,
        encoding: 'base64'
      });
    }

    await transporter.sendMail({
      from: `"Destinix Travel" <${user}>`,
      to: email,
      subject: "🎉 Booking Confirmed - Destinix",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #4f46e5; text-align: center;">Booking Confirmed 🎉</h2>
          <p>Hi ${name},</p>
          <p>Your booking has been successfully confirmed. We're excited to have you travel with us!</p>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Package:</strong> ${packageTitle}</p>
            <p><strong>Destination:</strong> ${destination}</p>
            <p><strong>Vehicle:</strong> ${vehicle}</p>
            <p><strong>Travel Date:</strong> ${travelDate}</p>
            <p><strong>Amount Paid:</strong> ₹${amount?.toLocaleString('en-IN')}</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
            <p><strong>Payment ID:</strong> ${paymentId}</p>
          </div>
          
          <p>We've attached your official receipt to this email for your records.</p>
          <p>Thank you for choosing <strong>Destinix Travel</strong> ✈️</p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #666; text-align: center;">&copy; 2026 Destinix Travel. All rights reserved.</p>
        </div>
      `,
      attachments
    });

    res.json({ success: true });

  } catch (error: any) {
    console.error("Email error:", error);
    res.status(500).json({ error: "Email failed", details: error.message });
  }
});

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = process.env.SMTP_USER || process.env.EMAIL_USER;
    const recipient = "vishwamistry18@gmail.com";

    if (!user) {
      console.log("Contact Email skip: No credentials configured");
      return res.json({ success: true, message: "Email skipped (no config)" });
    }

    await transporter.sendMail({
      from: `"Destinix Contact" <${user}>`,
      to: recipient,
      replyTo: email,
      subject: `📩 New Contact Inquiry from ${name}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1a1a1a; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #4f46e5; margin: 0; font-size: 24px;">New Inquiry Received</h2>
            <p style="color: #64748b; margin-top: 8px;">You have a new message from the Destinix Contact Form</p>
          </div>
          
          <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #edf2f7;">
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Full Name</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 500; color: #1e293b;">${name}</p>
            </div>
            
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Email Address</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 500; color: #1e293b;">${email}</p>
            </div>
            
            <div style="margin-bottom: 16px;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Phone Number</p>
              <p style="margin: 4px 0 0 0; font-size: 16px; font-weight: 500; color: #1e293b;">${phone}</p>
            </div>
            
            <div style="margin-bottom: 0;">
              <p style="margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;">Message</p>
              <p style="margin: 4px 0 0 0; font-size: 15px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 24px;">
            <p style="margin: 0;">This email was sent from the contact form on <strong>Destinix Travel</strong>.</p>
            <p style="margin: 4px 0 0 0;">&copy; 2026 Destinix Travel. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    res.json({ success: true, message: "Message sent successfully" });

  } catch (error: any) {
    console.error("Contact Email error:", error);
    res.status(500).json({ error: "Failed to send message", details: error.message });
  }
});

app.post("/api/create-order", async (req, res) => {
  const { amount, currency = "INR" } = req.body;

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || keyId.includes("placeholder") || !keySecret || keySecret.includes("placeholder")) {
    console.log("Razorpay credentials missing or using placeholders. Skipping server-side order creation.");
    return res.status(200).json({ 
      skipOrder: true,
      message: "Razorpay server-side keys not configured. Falling back to client-side payment flow."
    });
  }

  try {
    const options = {
      amount: Math.round(amount), // amount is already in paise from frontend
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    console.log("Creating Razorpay order with options:", options);
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    res.status(500).json({ 
      error: "Failed to create Razorpay order", 
      details: error.message || "Unknown error"
    });
  }
});

app.post("/api/verify-payment", (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSign = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
    .update(sign.toString())
    .digest("hex");

  if (razorpay_signature === expectedSign) {
    res.json({ success: true, message: "Payment verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid signature" });
  }
});

app.get("/api/reviews/:packageId", async (req, res) => {
  const { packageId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { packageId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reviews);
  } catch (error: any) {
    console.error("Failed to fetch reviews:", error);
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

app.post("/api/reviews", async (req, res) => {
  const { packageId, email, rating, comment } = req.body;
  if (!packageId || !email || !rating) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        packageId,
        user: { email: { equals: email, mode: 'insensitive' } },
        status: 'Confirmed'
      }
    });

    if (!booking) {
      return res.status(403).json({ error: "You must have a confirmed booking for this package to leave a review." });
    }

    const review = await prisma.review.create({
      data: {
        packageId,
        userId: booking.userId,
        rating,
        comment
      },
      include: { user: true }
    });

    res.json(review);
  } catch (error: any) {
    console.error("Failed to submit review:", error);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

const VALID_EXPENSE_CATEGORIES = ['food', 'transport', 'stay', 'activities', 'other'];

app.post("/api/expenses", async (req, res) => {
  const { userId, tripLabel, category, amount, currency, note } = req.body;

  if (!userId || !tripLabel || !category || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      error: "Invalid request",
      message: "userId, tripLabel, category, and a positive amount are required.",
    });
  }

  if (!VALID_EXPENSE_CATEGORIES.includes(category)) {
    return res.status(400).json({
      error: "Invalid request",
      message: `category must be one of: ${VALID_EXPENSE_CATEGORIES.join(', ')}`,
    });
  }

  const currencyCode = (currency || 'INR').toUpperCase();

  let amountINR: number;
  try {
    amountINR = await convertToINR(amount, currencyCode);
  } catch (error: any) {
    console.error("Currency conversion failed:", error);
    return res.status(502).json({
      error: "Conversion failed",
      message: "Could not determine an INR conversion rate. Please try again.",
    });
  }

  try {
    const expense = await prisma.expense.create({
      data: {
        userId,
        tripLabel,
        category,
        amount,
        currency: currencyCode,
        amountINR,
        note: note || null,
      },
    });
    res.status(201).json({ success: true, data: expense });
  } catch (error: any) {
    console.error("Create expense error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to create expense." });
  }
});

app.get("/api/expenses/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: expenses });
  } catch (error: any) {
    console.error("Fetch expenses error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to fetch expenses." });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ error: "Not Found", message: "Expense not found." });
    }

    await prisma.expense.delete({ where: { id } });
    res.json({ success: true, message: "Expense deleted." });
  } catch (error: any) {
    console.error("Delete expense error:", error);
    res.status(500).json({ error: "Internal Server Error", message: "Failed to delete expense." });
  }
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
