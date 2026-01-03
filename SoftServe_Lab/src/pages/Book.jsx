import { useMemo, useState } from "react";
import PageSection from "../components/layout/PageSection.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";
import Textarea from "../components/ui/Textarea.jsx";

const API_URL = "http://localhost:5050";

function flattenZodErrors(details) {
  const fieldErrors = details?.fieldErrors || {};
  const formErrors = details?.formErrors || [];
  const messages = [];

  for (const [field, errs] of Object.entries(fieldErrors)) {
    if (Array.isArray(errs) && errs.length) {
      messages.push(`${field}: ${errs.join(", ")}`);
    }
  }
  for (const msg of formErrors) messages.push(msg);

  return messages;
}

// Convert local date+time inputs to ISO string (backend expects z.string().datetime())
function toISOFromLocal(dateStr, timeStr) {
  // dateStr: "2026-01-03" timeStr: "14:30"
  // Create a local Date and convert to ISO
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = timeStr.split(":").map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0);
  return dt.toISOString();
}

export default function Book() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service: "Website Consultation",
    preferredDate: "", // UI only
    preferredTime: "", // UI only
    notes: "",
    companyWebsite: "", // honeypot
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");
  const [errorList, setErrorList] = useState([]);
  const [bookingId, setBookingId] = useState(null);

  const services = useMemo(
    () => [
      "Website Consultation",
      "Website Redesign",
      "Landing Page",
      "SEO Setup",
      "Maintenance & Support",
      "Other",
    ],
    []
  );

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setErrorList([]);
    setBookingId(null);

    try {
      if (!form.preferredDate || !form.preferredTime) {
        setStatus("error");
        setError("Please select a preferred date and time.");
        return;
      }

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        service: form.service,
        preferredDateTime: toISOFromLocal(form.preferredDate, form.preferredTime),
        notes: form.notes,
        companyWebsite: form.companyWebsite,
      };

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const detailsMessages = flattenZodErrors(data?.details);
        if (detailsMessages.length) {
          setErrorList(detailsMessages);
          throw new Error("Please fix the highlighted fields.");
        }
        throw new Error(data?.error || "Request failed");
      }

      setStatus("success");
      setBookingId(data?.bookingId || null);

      setForm({
        name: "",
        email: "",
        phone: "",
        service: "Website Consultation",
        preferredDate: "",
        preferredTime: "",
        notes: "",
        companyWebsite: "",
      });
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <PageSection
      title="Book Online"
      subtitle="Schedule a consultation at a time that works for you."
      stickyHeader
      showDividerTop
    >
      <Card className="p-8 max-w-2xl">
        {status === "success" ? (
          <div className="py-10 text-center">
            <h2 className="text-xl font-semibold dark:text-text-primary light:text-light-text-primary">
              Booking request received
            </h2>
            <p className="mt-2 dark:text-text-secondary light:text-light-text-secondary">
              We’ll confirm your booking via email shortly.
            </p>

            {bookingId ? (
              <p className="mt-4 text-sm dark:text-text-muted light:text-light-text-muted">
                Booking ID: <span className="font-medium">{bookingId}</span>
              </p>
            ) : null}

            <div className="mt-6">
              <Button variant="secondary" type="button" onClick={() => setStatus("idle")}>
                Create another booking
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-6">
            {/* Honeypot (hidden) */}
            <input
              type="text"
              name="companyWebsite"
              value={form.companyWebsite}
              onChange={handleChange}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="grid gap-2">
              <label className="text-sm dark:text-text-secondary light:text-light-text-secondary">
                Name
              </label>
              <Input
                name="name"
                placeholder="Your full name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm dark:text-text-secondary light:text-light-text-secondary">
                Email
              </label>
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm dark:text-text-secondary light:text-light-text-secondary">
                Phone (optional)
              </label>
              <Input
                name="phone"
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm dark:text-text-secondary light:text-light-text-secondary">
                Service
              </label>
              <select
                name="service"
                value={form.service}
                onChange={handleChange}
                className="
                  w-full rounded-xl border px-4 py-3 text-sm transition outline-none
                  dark:border-border dark:bg-bg dark:text-text-primary dark:focus:border-accent
                  light:border-light-border light:bg-light-bg light:text-light-text-primary light:focus:border-light-accent
                "
              >
                {services.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm dark:text-text-secondary light:text-light-text-secondary">
                  Preferred date
                </label>
                <Input
                  type="date"
                  name="preferredDate"
                  value={form.preferredDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm dark:text-text-secondary light:text-light-text-secondary">
                  Preferred time
                </label>
                <Input
                  type="time"
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <label className="text-sm dark:text-text-secondary light:text-light-text-secondary">
                Notes (optional)
              </label>
              <Textarea
                name="notes"
                placeholder="Anything we should know before the call?"
                value={form.notes}
                onChange={handleChange}
              />
            </div>

            {/* Error UI */}
            {status === "error" && (error || errorList.length > 0) && (
              <div
                className="
                  rounded-xl border p-4
                  dark:border-border dark:bg-bg
                  light:border-light-border light:bg-light-bg
                "
              >
                {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}

                {errorList.length > 0 ? (
                  <ul className="mt-2 list-disc pl-5 text-sm text-red-600 space-y-1">
                    {errorList.map((m) => (
                      <li key={m}>{m}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            )}

            <Button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Submitting..." : "Request Booking"}
            </Button>

            <p className="text-xs dark:text-text-muted light:text-light-text-muted">
              Your booking request will be reviewed and confirmed by email.
            </p>
          </form>
        )}
      </Card>
    </PageSection>
  );
}
