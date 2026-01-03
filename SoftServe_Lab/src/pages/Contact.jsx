import { useState } from "react";
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

  for (const msg of formErrors) {
    messages.push(msg);
  }

  return messages;
}

export default function Contact() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    message: "",
    companyWebsite: "", // honeypot
  });

  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [error, setError] = useState("");
  const [errorList, setErrorList] = useState([]);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setErrorList([]);

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
        companyWebsite: "",
      });
    } catch (err) {
      setStatus("error");
      setError(err?.message || "Something went wrong. Please try again.");
    }
  }

  return (
    <PageSection
      title="Get in Touch"
      subtitle="Tell us about your project and we’ll get back to you shortly."
      stickyHeader
      showDividerTop
    >
      <Card className="p-8 max-w-2xl">
        {status === "success" ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold dark:text-text-primary light:text-light-text-primary">
              Message sent successfully
            </h2>
            <p className="mt-2 dark:text-text-secondary light:text-light-text-secondary">
              We’ll be in touch soon.
            </p>

            <div className="mt-6">
              <Button
                variant="secondary"
                onClick={() => setStatus("idle")}
                type="button"
              >
                Send another message
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm dark:text-text-secondary light:text-light-text-secondary">
                  First name
                </label>
                <Input
                  name="firstName"
                  placeholder="First name"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm dark:text-text-secondary light:text-light-text-secondary">
                  Last name
                </label>
                <Input
                  name="lastName"
                  placeholder="Last name"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
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
                Message
              </label>
              <Textarea
                name="message"
                placeholder="Tell us about your project..."
                value={form.message}
                onChange={handleChange}
                required
              />
              <p className="text-xs dark:text-text-muted light:text-light-text-muted">
                Minimum 5 characters.
              </p>
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
                {error ? (
                  <p className="text-sm font-semibold text-red-600">{error}</p>
                ) : null}

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
              {status === "loading" ? "Sending..." : "Send Message"}
            </Button>

            <p className="text-xs dark:text-text-muted light:text-light-text-muted">
              By submitting, you agree to be contacted regarding your request.
            </p>
          </form>
        )}
      </Card>
    </PageSection>
  );
}
