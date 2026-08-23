import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

function MedCard({ m }) {
  const start = m.startDate ? new Date(m.startDate).toLocaleDateString() : "—";
  const end = m.endDate ? new Date(m.endDate).toLocaleDateString() : "—";
  const ongoing = !m.endDate;
  return (
    <li style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--card)" }}>
      <div style={{ fontWeight: 700, color: "var(--text)" }}>{m.name}</div>
      <div style={{ color: "var(--muted)" }}>{m.dosage} • {m.frequency}</div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>
        From {start} to {end} {ongoing ? "(ongoing)" : ""}
      </div>
      {m.notes ? <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Notes: {m.notes}</div> : null}
    </li>
  );
}

export default function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  }, [id]);

  // The backend does not store an "ongoing" flag — a medication with no end
  // date is current, one with a past or present end date is history. This
  // mirrors the original form's behaviour of leaving end date blank to mean
  // ongoing.
  const currentMeds = useMemo(() => meds.filter((m) => !m.endDate), [meds]);
  const historyMeds = useMemo(() => meds.filter((m) => !!m.endDate), [meds]);

  const addMedication = async (e) => {
    e.preventDefault();
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
    if (!window.confirm(`Delete ${profile?.name}'s profile and all related data? This cannot be undone.`)) return;

    try {
      await api.delete(`/profiles/${id}`);
      navigate("/profiles");
    } catch (err) {
      console.error("Failed to delete profile:", err);
      alert("Failed to delete profile.");
    }
  };

  if (notFound) return <p style={{ marginTop: "1rem" }}>Profile not found.</p>;
  if (loading || !profile) return <p style={{ marginTop: "1rem" }}>Loading…</p>;

  const dob = profile.dob ? new Date(profile.dob).toLocaleDateString() : "—";
  const age = profile.dob
    ? Math.floor((Date.now() - new Date(profile.dob).getTime()) / (365.25 * 24 * 3600 * 1000))
    : "—";

  return (
    <section style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
      <h2>{profile.name}</h2>
      <div style={{ color: "var(--muted)" }}>
        DOB: {dob} • Age: {age} • Gender: {profile.gender} • Blood: {profile.bloodGroup}
      </div>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button
          onClick={() => setViewHistory(false)}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: 10,
            background: viewHistory ? "var(--card)" : "var(--accent)",
            border: "1px solid var(--border)",
            fontWeight: 600,
          }}
        >
          Current Medicines
        </button>
        <button
          onClick={() => setViewHistory(true)}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: 10,
            background: viewHistory ? "var(--accent)" : "var(--card)",
            border: "1px solid var(--border)",
            fontWeight: 600,
          }}
        >
          Medicine History
        </button>

        <div style={{ flex: 1 }} />

        {/* Delete Profile */}
        <button
          onClick={deleteProfileAndData}
          style={{
            padding: "0.5rem 0.9rem",
            borderRadius: 10,
            border: "1px solid var(--border)",
            background: "var(--card)",
            color: "var(--text)",
          }}
        >
          Delete Profile
        </button>
      </div>

      {/* Add Medicine */}
      <form
        onSubmit={addMedication}
        style={{
          display: "grid",
          gap: 8,
          maxWidth: 720,
          padding: 12,
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
        }}
      >
        <strong>Add Medicine</strong>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input placeholder="Medicine (e.g., Amoxicillin 500mg)" value={name} onChange={(e) => setName(e.target.value)} required />
          <input placeholder="Dosage (e.g., 1 tab)" value={dosage} onChange={(e) => setDosage(e.target.value)} required />
          <input placeholder="Frequency (e.g., 2x/day after food)" value={frequency} onChange={(e) => setFrequency(e.target.value)} required />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          <input type="date" value={endDateStr} onChange={(e) => setEndDateStr(e.target.value)} placeholder="End date (optional)" />
          <input placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Leave “End date” empty to mark as <strong>ongoing</strong>.
        </div>
        <button type="submit" style={{ width: "fit-content" }}>Add</button>
      </form>

      {/* List */}
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 10 }}>
        {(viewHistory ? historyMeds : currentMeds).map((m) => (
          <MedCard key={m._id} m={m} />
        ))}
      </ul>
      {!viewHistory && currentMeds.length === 0 && <p style={{ color: "var(--muted)" }}>No current medicines.</p>}
      {viewHistory && historyMeds.length === 0 && <p style={{ color: "var(--muted)" }}>No history yet.</p>}
    </section>
  );
}
