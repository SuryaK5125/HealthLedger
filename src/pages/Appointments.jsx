import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";

export default function Appointments() {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  // form
  const [profileId, setProfileId] = useState("");
  const [doctor, setDoctor] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");
  const [notes, setNotes] = useState("");

  const [profiles, setProfiles] = useState([]);

  // The backend scopes appointment lists to one profile at a time (ownership
  // flows through a specific profile, not "all of mine" at once). To show
  // upcoming appointments across every family member, profiles are fetched
  // first and then each profile's appointments are fetched in parallel and
  // merged client-side — a handful of requests at family-app scale, not
  // worth adding a new backend aggregate endpoint for.
  const loadUpcoming = async (profileList) => {
    const results = await Promise.all(
      profileList.map((p) => api.get("/appointments", { params: { profileId: p._id } }))
    );
    const now = Date.now();
    const merged = results
      .flatMap((res) => res.data)
      .filter((a) => new Date(a.date).getTime() >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    setAppts(merged);
  };

  useEffect(() => {
    (async () => {
      const ps = await api.get("/profiles");
      setProfiles(ps.data);
      await loadUpcoming(ps.data);
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAppt = async (e) => {
    e.preventDefault();
    if (!profileId || !doctor || !dateStr || !timeStr) {
      alert("Profile, doctor, date, and time are required.");
      return;
    }
    const date = new Date(`${dateStr}T${timeStr}:00`).toISOString();
    try {
      await api.post("/appointments", { profileId, doctor, specialty, location, notes, date });
      await loadUpcoming(profiles);
      setDoctor(""); setSpecialty(""); setLocation(""); setDateStr(""); setTimeStr(""); setNotes("");
    } catch (err) {
      alert(err.response?.data?.details?.[0]?.message || err.response?.data?.message || "Failed to add appointment");
    }
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <PageHeader title="Appointments" subtitle="Schedule and track upcoming visits for the whole family." />

      {/* Add appointment */}
      <form onSubmit={addAppt} className="card" style={{ padding: "var(--space-4)", display: "grid", gap: "var(--space-3)", maxWidth: 800 }}>
        <strong style={{ fontSize: "var(--font-size-lg)" }}>Schedule New</strong>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label htmlFor="appt-profile">Profile</label>
            <select id="appt-profile" value={profileId} onChange={e=>setProfileId(e.target.value)} required>
              <option value="">Select profile</option>
              {profiles.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label htmlFor="appt-doctor">Doctor</label>
            <input id="appt-doctor" placeholder="Doctor" value={doctor} onChange={e=>setDoctor(e.target.value)} required />
          </div>
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label htmlFor="appt-specialty">Specialty</label>
            <input id="appt-specialty" placeholder="e.g., ENT" value={specialty} onChange={e=>setSpecialty(e.target.value)} />
          </div>
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label htmlFor="appt-location">Location / Hospital</label>
            <input id="appt-location" placeholder="Location / Hospital" value={location} onChange={e=>setLocation(e.target.value)} />
          </div>
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label htmlFor="appt-date">Date</label>
            <input id="appt-date" type="date" value={dateStr} onChange={e=>setDateStr(e.target.value)} required />
          </div>
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label htmlFor="appt-time">Time</label>
            <input id="appt-time" type="time" value={timeStr} onChange={e=>setTimeStr(e.target.value)} required />
          </div>
          <div style={{ display: "grid", gap: "var(--space-1)", gridColumn: "1 / -1" }}>
            <label htmlFor="appt-notes">Notes (optional)</label>
            <input id="appt-notes" placeholder="Notes" value={notes} onChange={e=>setNotes(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="btn-primary" style={{ width: "fit-content" }}>Add</button>
      </form>

      {/* Upcoming list */}
      <section className="card" style={{ padding: "var(--space-4)" }}>
        <h3 style={{ marginTop: 0, marginBottom: "var(--space-3)", fontSize: "var(--font-size-lg)" }}>Upcoming</h3>
        {loading ? (
          <p className="muted">Loading…</p>
        ) : appts.length === 0 ? (
          <EmptyState title="No upcoming appointments" message="Schedule one above to see it here." />
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--space-2)" }}>
            {appts.map(a => (
              <li key={a._id} style={{ padding: "var(--space-3)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", display: "grid", gap: "var(--space-1)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--space-1)" }}>
                  <div style={{ fontWeight: 700 }}>{a.doctor} {a.specialty ? `• ${a.specialty}` : ""}</div>
                  <span className="badge">{profiles.find(p=>p._id===a.profileId)?.name || "—"}</span>
                </div>
                <div className="muted" style={{ fontSize: "var(--font-size-sm)" }}>
                  {a.location || "—"} • {new Date(a.date).toLocaleString()}
                </div>
                {a.notes && <div style={{ fontSize: "var(--font-size-sm)" }}>{a.notes}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
