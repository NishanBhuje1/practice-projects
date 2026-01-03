import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import pkg from "@prisma/client";

import {
  sendAdminContactEmail,
  sendAdminBookingEmail,
  sendContactAutoReply,
  sendBookingAutoReply,
} from "./email.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const app = express();

app.use(helmet());
app.use(express.json());

// CORS (allow your Vite dev server)
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);

// Rate limit for form submissions
const formLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Simple honeypot field to reduce spam
const HONEYPOT_FIELD = "companyWebsite";

/** CONTACT validation */
const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(80),
  lastName: z.string().min(1, "Last name is required").max(80),
  email: z.string().email("Email is invalid").max(200),
  phone: z.string().max(40).optional().or(z.literal("")),
  message: z.string().min(5, "Message must be at least 5 characters").max(3000),
  [HONEYPOT_FIELD]: z.string().optional(),
});

app.post("/api/contact", formLimiter, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Invalid input",
      details: parsed.error.flatten(),
    });
  }

  // Honeypot spam check
  if (parsed.data[HONEYPOT_FIELD]) {
    return res.json({ ok: true });
  }

  const { firstName, lastName, email, phone, message } = parsed.data;

  try {
    await prisma.contactMessage.create({
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        message,
      },
    });

    // Fire-and-forget emails (don’t block user)
    sendAdminContactEmail({ firstName, lastName, email, phone, message }).catch(
      console.error
    );
    sendContactAutoReply({ toEmail: email, firstName }).catch(console.error);

    return res.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/** BOOKINGS validation */
const bookingSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  email: z.string().email("Email is invalid").max(200),
  phone: z.string().max(40).optional().or(z.literal("")),
  service: z.string().min(1, "Service is required").max(200),
  preferredDateTime: z.string().datetime(),
  notes: z.string().max(3000).optional().or(z.literal("")),
  [HONEYPOT_FIELD]: z.string().optional(),
});

app.post("/api/bookings", formLimiter, async (req, res) => {
  const parsed = bookingSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Invalid input",
      details: parsed.error.flatten(),
    });
  }

  // Honeypot spam check
  if (parsed.data[HONEYPOT_FIELD]) {
    return res.json({ ok: true, bookingId: null });
  }

  const { name, email, phone, service, preferredDateTime, notes } = parsed.data;

  try {
    const booking = await prisma.booking.create({
      data: {
        name,
        email,
        phone: phone || null,
        service,
        preferredDateTime: new Date(preferredDateTime),
        notes: notes || null,
        // status defaults to PENDING
      },
      select: { id: true },
    });

    const displayTime = new Date(preferredDateTime).toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
    });

    // Fire-and-forget emails
    sendAdminBookingEmail({
      bookingId: booking.id,
      name,
      email,
      phone,
      service,
      preferredDateTime: displayTime,
      notes,
    }).catch(console.error);

    sendBookingAutoReply({
      toEmail: email,
      name,
      service,
      preferredDateTime: displayTime,
    }).catch(console.error);

    return res.json({ ok: true, bookingId: booking.id });
  } catch (err) {
    console.error("Bookings route error:", err);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/* =========================
   SIMPLE ADMIN (TOKEN AUTH)
   ========================= */

function requireAdmin(req, res) {
  const token = req.header("x-admin-token");
  if (!process.env.ADMIN_TOKEN) {
    res.status(500).json({ ok: false, error: "ADMIN_TOKEN not set" });
    return true;
  }
  if (token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ ok: false, error: "Unauthorized" });
    return true;
  }
  return false;
}

// Admin: list contact messages
app.get("/api/admin/contacts", async (req, res) => {
  if (requireAdmin(req, res)) return;

  const items = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  res.json({ ok: true, items });
});

// Admin: list bookings
app.get("/api/admin/bookings", async (req, res) => {
  if (requireAdmin(req, res)) return;

  const items = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  res.json({ ok: true, items });
});

// Admin: update contact status
app.patch("/api/admin/contacts/:id", async (req, res) => {
  if (requireAdmin(req, res)) return;

  const { id } = req.params;
  const schema = z.object({ status: z.enum(["NEW", "READ", "ARCHIVED"]) });
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Invalid input",
      details: parsed.error.flatten(),
    });
  }

  const updated = await prisma.contactMessage.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  res.json({ ok: true, item: updated });
});

// Admin: update booking status
app.patch("/api/admin/bookings/:id", async (req, res) => {
  if (requireAdmin(req, res)) return;

  const { id } = req.params;
  const schema = z.object({
    status: z.enum(["PENDING", "CONFIRMED", "CANCELLED"]),
  });
  const parsed = schema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: "Invalid input",
      details: parsed.error.flatten(),
    });
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  res.json({ ok: true, item: updated });
});

// Graceful shutdown (helps on Windows dev restarts)
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

const port = Number(process.env.PORT || 5050);
app.listen(port, () => {
  console.log(`SoftServe API running: http://localhost:${port}`);
});
