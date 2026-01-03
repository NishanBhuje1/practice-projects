import { useMemo, useState } from "react";
import PageSection from "../components/layout/PageSection.jsx";
import Card from "../components/ui/Card.jsx";
import Button from "../components/ui/Button.jsx";
import Input from "../components/ui/Input.jsx";

const API_URL = "http://localhost:5050";

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-AU", {
      timeZone: "Australia/Sydney",
    });
  } catch {
    return iso;
  }
}

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("ADMIN_TOKEN") || "");
  const [tab, setTab] = useState("contacts"); // contacts | bookings
  const [contacts, setContacts] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | loading | error
  const [error, setError] = useState("");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-admin-token": token,
    }),
    [token]
  );

  async function load() {
    setStatus("loading");
    setError("");

    try {
      const [cRes, bRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/contacts`, { headers }),
        fetch(`${API_URL}/api/admin/bookings`, { headers }),
      ]);

      const cData = await cRes.json().catch(() => null);
      const bData = await bRes.json().catch(() => null);

      if (!cRes.ok) throw new Error(cData?.error || "Failed to load contacts");
      if (!bRes.ok) throw new Error(bData?.error || "Failed to load bookings");

      setContacts(cData?.items || []);
      setBookings(bData?.items || []);
      localStorage.setItem("ADMIN_TOKEN", token);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e?.message || "Failed to load admin data");
    }
  }

  async function updateContactStatus(id, nextStatus) {
    try {
      const res = await fetch(`${API_URL}/api/admin/contacts/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Update failed");

      setContacts((prev) => prev.map((x) => (x.id === id ? data.item : x)));
    } catch (e) {
      alert(e?.message || "Update failed");
    }
  }

  async function updateBookingStatus(id, nextStatus) {
    try {
      const res = await fetch(`${API_URL}/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "Update failed");

      setBookings((prev) => prev.map((x) => (x.id === id ? data.item : x)));
    } catch (e) {
      alert(e?.message || "Update failed");
    }
  }

  const headerRight = (
    <div className="flex flex-wrap items-center gap-3">
      <div className="w-[260px]">
        <Input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN"
        />
      </div>

      <Button
        variant="secondary"
        type="button"
        onClick={() => setTab("contacts")}
      >
        Contacts
      </Button>
      <Button
        variant="secondary"
        type="button"
        onClick={() => setTab("bookings")}
      >
        Bookings
      </Button>

      <Button
        type="button"
        onClick={load}
        disabled={!token || status === "loading"}
      >
        {status === "loading" ? "Loading..." : "Load"}
      </Button>
    </div>
  );

  return (
    <PageSection
      title="Admin"
      subtitle="Manage contact messages and booking requests (token protected)."
      stickyHeader
      showDividerTop
      headerRight={headerRight}
    >
      {status === "error" ? (
        <Card className="p-4 max-w-3xl">
          <p className="text-sm font-semibold text-red-600">Error</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </Card>
      ) : null}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          {tab === "contacts" ? (
            <table className="min-w-full text-sm">
              <thead
                className="
                  text-left
                  dark:bg-bg dark:text-text-secondary
                  light:bg-light-bg light:text-light-text-secondary
                "
              >
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Phone</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Message</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="border-t dark:border-border light:border-light-border"
                  >
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      {formatDate(c.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium dark:text-text-primary light:text-light-text-primary">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      {c.phone || "-"}
                    </td>
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      {c.status}
                    </td>
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      <div className="max-w-[460px] truncate" title={c.message}>
                        {c.message}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => updateContactStatus(c.id, "READ")}
                        >
                          Mark Read
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => updateContactStatus(c.id, "ARCHIVED")}
                        >
                          Archive
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {contacts.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-10 text-center dark:text-text-muted light:text-light-text-muted"
                      colSpan={7}
                    >
                      No contact messages yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full text-sm">
              <thead
                className="
                  text-left
                  dark:bg-bg dark:text-text-secondary
                  light:bg-light-bg light:text-light-text-secondary
                "
              >
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">Preferred</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-t dark:border-border light:border-light-border"
                  >
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      {formatDate(b.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium dark:text-text-primary light:text-light-text-primary">
                      {b.name}
                    </td>
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      {b.email}
                    </td>
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      {b.service}
                    </td>
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      {formatDate(b.preferredDateTime)}
                    </td>
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      {b.status}
                    </td>
                    <td className="px-4 py-3 dark:text-text-secondary light:text-light-text-secondary">
                      <div
                        className="max-w-[460px] truncate"
                        title={b.notes || ""}
                      >
                        {b.notes || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => updateBookingStatus(b.id, "CONFIRMED")}
                        >
                          Confirm
                        </Button>
                        <Button
                          variant="secondary"
                          type="button"
                          onClick={() => updateBookingStatus(b.id, "CANCELLED")}
                        >
                          Cancel
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}

                {bookings.length === 0 ? (
                  <tr>
                    <td
                      className="px-4 py-10 text-center dark:text-text-muted light:text-light-text-muted"
                      colSpan={8}
                    >
                      No bookings yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <p className="mt-4 text-xs dark:text-text-muted light:text-light-text-muted">
        Token is stored locally in your browser. Do not share it.
      </p>
    </PageSection>
  );
}
