import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function mustEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

const FROM = () => mustEnv("FROM_EMAIL");
const TO_ADMIN = () => mustEnv("NOTIFY_TO_EMAIL");

export async function sendAdminContactEmail({ firstName, lastName, email, phone, message }) {
  const subject = `New Contact: ${firstName} ${lastName}`;
  const text =
    `New contact form submission:\n\n` +
    `Name: ${firstName} ${lastName}\n` +
    `Email: ${email}\n` +
    `Phone: ${phone || "-"}\n\n` +
    `Message:\n${message}\n`;

  await resend.emails.send({
    from: FROM(),
    to: TO_ADMIN(),
    subject,
    text,
    replyTo: email,
  });
}

export async function sendAdminBookingEmail({ name, email, phone, service, preferredDateTime, notes, bookingId }) {
  const subject = `New Booking: ${service} (${name})`;
  const text =
    `New booking received:\n\n` +
    `Booking ID: ${bookingId}\n` +
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Phone: ${phone || "-"}\n` +
    `Service: ${service}\n` +
    `Preferred time: ${preferredDateTime}\n\n` +
    `Notes:\n${notes || "-"}\n`;

  await resend.emails.send({
    from: FROM(),
    to: TO_ADMIN(),
    subject,
    text,
    replyTo: email,
  });
}

// Optional: auto-replies
export async function sendContactAutoReply({ toEmail, firstName }) {
  await resend.emails.send({
    from: FROM(),
    to: toEmail,
    subject: "We received your message",
    text:
      `Hi ${firstName},\n\n` +
      `Thanks for reaching out to SoftServe Lab. We’ve received your message and will respond shortly.\n\n` +
      `Regards,\nSoftServe Lab`,
  });
}

export async function sendBookingAutoReply({ toEmail, name, service, preferredDateTime }) {
  await resend.emails.send({
    from: FROM(),
    to: toEmail,
    subject: "Booking received",
    text:
      `Hi ${name},\n\n` +
      `Thanks for your booking request.\n\n` +
      `Service: ${service}\n` +
      `Preferred time: ${preferredDateTime}\n\n` +
      `We’ll confirm the booking shortly.\n\n` +
      `Regards,\nSoftServe Lab`,
  });
}
