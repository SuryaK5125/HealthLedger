import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import EmptyState from "../components/EmptyState";
import { demoProfiles, demoMedications } from "../data/demoData";

function MedCard({ m }) {
  const start = m.startDate ? new Date(m.startDate).toLocaleDateString() : "—";
  const end = m.endDate ? new Date(m.endDate).toLocaleDateString() : "—";
  const ongoing = !m.endDate;
  return (
    <li className="card" style={{ padding: "var(--space-3)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-2)" }}>
        <div style={{ fontWeight: 700 }}>{m.name}</div>
        {ongoing && <span className="badge">Ongoing</span>}
      </div>
      <div className="muted" style={{ fontSize: "var(--font-size-sm)" }}>{m.dosage} • {m.frequency}</div>
      <div className="muted" style={{ fontSize: "var(--font-size-xs)", marginTop: "var(--space-1)" }}>
        From {start} to {end}
      </div>
      {m.notes ? <div className="muted" style={{ fontSize: "var(--font-size-xs)", marginTop: "var(--space-1)" }}>Notes: {m.notes}</div> : null}
    </li>
  );
}

export default function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDemo } = useAuth();

  const [profile, setProfile] = useState(null);
  const [viewHistory, setViewHistory] = useState(false);
  const [meds, setMeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // add-med form
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDateStr, setEndDateStr] = useState(""); // optional

  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isDemo) {
      const demoProfile = demoProfiles.find((p) => p._id === id);
      if (!demoProfile) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setProfile(demoProfile);
      setMeds(demoMedications.filter((m) => m.profileId === id));
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const [profileRes, medsRes] = await Promise.all([
          api.get(`/profiles/${id}`),
          api.get(`/medications`, { params: { profileId: id } }),
        ]);
        setProfile(profileRes.data);
        setMeds(medsRes.data);
      } catch (err) {
        // 404 covers both "doesn't exist" and "belongs to someone else" —
        // from the UI's perspective those are the same case.
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isDemo]);

  // The backend does not store an "ongoing" flag — a medication with no end
  // date is current, one with a past or present end date is history. This
  // mirrors the original form's behaviour of leaving end date blank to mean
  // ongoing.
  const currentMeds = useMemo(() => meds.filter((m) => !m.endDate), [meds]);
  const historyMeds = useMemo(() => meds.filter((m) => !!m.endDate), [meds]);

  const addMedication = async (e) => {
    e.preventDefault();
    if (isDemo) return;
    if (!name || !dosage || !frequency || !startDate) {
      alert("Fill required fields");
      return;
    }
    try {
      const res = await api.post("/medications", {
        profileId: id,
        name,
        dosage,
        frequency,
        startDate,
        endDate: endDateStr || null,
        notes,
      });
      setMeds((prev) => [res.data, ...prev]);
      setName("");
      setDosage("");
      setFrequency("");
      setStartDate("");
      setEndDateStr("");
      setNotes("");
    } catch (err) {
      alert(err.response?.data?.details?.[0]?.message || err.response?.data?.message || "Failed to add medication");
    }
  };

  // The backend now cascades this in one transaction (medications, records
  // and appointments for the profile, plus their Cloudinary assets) — the
  // client no longer has to orchestrate the batched deletes itself.
  const deleteProfileAndData = async () => {
    if (isDemo) return;
    if (!window.confirm(`Delete ${profile?.name}'s profile and all related data? This cannot be undone.`)) return;

    try {
      await api.delete(`/profiles/${id}`);
      navigate("/profiles");
    } catch (err) {
      console.error("Failed to delete profile:", err);
      alert("Failed to delete profile.");
    }
  };

  if (notFound) {
    return (
      <div style={{ marginTop: "var(--space-5)" }}>
        <EmptyState title="Profile not found" message="It may have been deleted, or it doesn't belong to your account." />
      </div>
    );
  }
  if (loading || !profile) return <p className="muted" style={{ marginTop: "var(--space-4)" }}>Loading…</p>;

  const dob = profile.dob ? new Date(profile.dob).toLocaleDateString() : "—";
  const age = profile.dob
    ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : "—";

  return (
    <section style={{ display: "grid", gap: "var(--space-5)" }}>
      {/* Profile summary */}
      <div className="card" style={{ padding: "var(--space-4)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "var(--space-3)" }}>
        <div>
          <h2 style={{ fontSize: "var(--font-size-2xl)", margin: 0 }}>{profile.name}</h2>
          <div className="muted" style={{ marginTop: "var(--space-1)", fontSize: "var(--font-size-sm)" }}>
            DOB {dob} • Age {age}
          </div>
          <div style={{ display: "flex", gap: "var(--space-1)", marginTop: "var(--space-2)", flexWrap: "wrap" }}>
            {profile.relationship && <span className="badge">{profile.relationship}</span>}
            <span className="badge">{profile.gender}</span>
            <span className="badge">{profile.bloodGroup}</span>
          </div>
        </div>
        <button
          onClick={deleteProfileAndData}
          className="btn-danger-outline"
          disabled={isDemo}
          title={isDemo ? "Sign in to make changes." : undefined}
        >
          Delete Profile
        </button>
      </div>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Medicine view"
        style={{ display: "inline-flex", gap: 2, padding: 4, background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", width: "fit-content" }}
      >
        <button
          role="tab"
          aria-selected={!viewHistory}
          onClick={() => setViewHistory(false)}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: "var(--radius-sm)",
            background: viewHistory ? "transparent" : "var(--accent)",
            color: viewHistory ? "var(--muted)" : "var(--accentText)",
            border: "none",
          }}
        >
          Current Medicines
        </button>
        <button
          role="tab"
          aria-selected={viewHistory}
          onClick={() => setViewHistory(true)}
          style={{
            padding: "0.45rem 0.9rem",
            borderRadius: "var(--radius-sm)",
            background: viewHistory ? "var(--accent)" : "transparent",
            color: viewHistory ? "var(--accentText)" : "var(--muted)",
            border: "none",
          }}
        >
          Medicine History
        </button>
      </div>

      {/* Add Medicine — a mutation form, hidden entirely in demo mode. */}
      {!isDemo && (
        <form onSubmit={addMedication} className="card" style={{ display: "grid", gap: "var(--space-3)", maxWidth: 720, padding: "var(--space-4)" }}>
          <strong style={{ fontSize: "var(--font-size-lg)" }}>Add Medicine</strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <label htmlFor="med-name">Medicine</label>
              <input id="med-name" placeholder="e.g., Amoxicillin 500mg" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <label htmlFor="med-dosage">Dosage</label>
              <input id="med-dosage" placeholder="e.g., 1 tab" value={dosage} onChange={(e) => setDosage(e.target.value)} required />
            </div>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <label htmlFor="med-frequency">Frequency</label>
              <input id="med-frequency" placeholder="e.g., 2x/day after food" value={frequency} onChange={(e) => setFrequency(e.target.value)} required />
            </div>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <label htmlFor="med-start">Start date</label>
              <input id="med-start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <label htmlFor="med-end">End date (optional)</label>
              <input id="med-end" type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} />
            </div>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <label htmlFor="med-notes">Notes (optional)</label>
              <input id="med-notes" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
          </div>
          <div className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
            Leave "End date" empty to mark as <strong>ongoing</strong>.
          </div>
          <button type="submit" className="btn-primary" style={{ width: "fit-content" }}>Add</button>
        </form>
      )}

      {/* List */}
      {(viewHistory ? historyMeds : currentMeds).length === 0 ? (
        <EmptyState
          title={viewHistory ? "No history yet" : "No current medicines"}
          message={viewHistory ? "Medicines with an end date will appear here." : "Add a medicine above to start tracking it."}
        />
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--space-2)" }}>
          {(viewHistory ? historyMeds : currentMeds).map((m) => (
            <MedCard key={m._id} m={m} />
          ))}
        </ul>
      )}
    </section>
  );
}
