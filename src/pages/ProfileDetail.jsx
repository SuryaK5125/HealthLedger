// src/pages/ProfileDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  Timestamp,
  writeBatch,
  deleteDoc,
  where,
} from "firebase/firestore";

function MedCard({ m }) {
  const start = m.startDate?.toDate?.()?.toLocaleDateString?.() || "—";
  const end = m.endDate ? m.endDate.toDate().toLocaleDateString() : "—";
  return (
    <li style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 12, background: "var(--card)" }}>
      <div style={{ fontWeight: 700, color: "var(--text)" }}>{m.name}</div>
      <div style={{ color: "var(--muted)" }}>{m.dosage} • {m.frequency}</div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>
        From {start} to {end} {m.ongoing ? "(ongoing)" : ""}
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

  // add-med form
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDateStr, setEndDateStr] = useState(""); // optional
  const [notes, setNotes] = useState("");
  const ongoing = !endDateStr; // if endDate empty → ongoing

  useEffect(() => {
    (async () => {
      // profile
      const snap = await getDoc(doc(db, "profiles", id));
      setProfile({ id: snap.id, ...snap.data() });

      // medications
      const medsRef = collection(db, "profiles", id, "medications");
      const qMeds = query(medsRef, orderBy("createdAt", "desc"));
      const msnap = await getDocs(qMeds);
      const rows = msnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMeds(rows);
      setLoading(false);
    })();
  }, [id]);

  const currentMeds = useMemo(() => meds.filter((m) => m.ongoing === true), [meds]);
  const historyMeds = useMemo(() => meds.filter((m) => m.ongoing === false), [meds]);

  const addMedication = async (e) => {
    e.preventDefault();
    if (!name || !dosage || !frequency || !startDate) {
      alert("Fill required fields");
      return;
    }
    const medsRef = collection(db, "profiles", id, "medications");
    await addDoc(medsRef, {
      name,
      dosage,
      frequency,
      startDate: Timestamp.fromDate(new Date(startDate)),
      endDate: endDateStr ? Timestamp.fromDate(new Date(endDateStr)) : null,
      ongoing,
      notes,
      createdAt: Timestamp.now(),
    });

    // refresh list
    const qMeds = query(medsRef, orderBy("createdAt", "desc"));
    const msnap = await getDocs(qMeds);
    setMeds(msnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    // reset form
    setName("");
    setDosage("");
    setFrequency("");
    setStartDate("");
    setEndDateStr("");
    setNotes("");
  };

  // Delete profile + all medications (+ optional related records)
  const deleteProfileAndData = async () => {
    if (!window.confirm(`Delete ${profile?.name}'s profile and all medications? This cannot be undone.`)) return;

    try {
      // 1) Delete medications (subcollection) in batches
      const medsRef = collection(db, "profiles", id, "medications");
      const medsSnap = await getDocs(medsRef);
      if (!medsSnap.empty) {
        let chunk = [];
        for (const d of medsSnap.docs) {
          chunk.push(d.ref);
          if (chunk.length === 400) {
            const batch = writeBatch(db);
            chunk.forEach((ref) => batch.delete(ref));
            await batch.commit();
            chunk = [];
          }
        }
        if (chunk.length) {
          const batch = writeBatch(db);
          chunk.forEach((ref) => batch.delete(ref));
          await batch.commit();
        }
      }

      // 2) Optional: delete related records if you store profileId on them
      try {
        const recordsRef = collection(db, "records");
        const recQ = query(recordsRef, where("forWho", "==", profile.name));
        const recSnap = await getDocs(recQ);
        if (!recSnap.empty) {
          let chunk = [];
          for (const d of recSnap.docs) {
            chunk.push(d.ref);
            if (chunk.length === 400) {
              const batch = writeBatch(db);
              chunk.forEach((ref) => batch.delete(ref));
              await batch.commit();
              chunk = [];
            }
          }
          if (chunk.length) {
            const batch = writeBatch(db);
            chunk.forEach((ref) => batch.delete(ref));
            await batch.commit();
          }
        }
      } catch {
        // If your records use `forWho` instead of profileId, switch to:
        // const recQ = query(recordsRef, where("forWho", "==", profile.name));
      }

      // 3) Delete the profile doc
      await deleteDoc(doc(db, "profiles", id));

      alert("Profile deleted.");
      navigate("/profiles");
    } catch (e) {
      console.error("Failed to delete profile:", e);
      alert("Failed to delete profile. Check console for details.");
    }
  };

  if (loading || !profile) return <p style={{ marginTop: "1rem" }}>Loading…</p>;

  const dob = profile.dob?.toDate?.()?.toLocaleDateString?.() || "—";
  const age = (() => {
    const d = profile.dob?.toDate?.();
    if (!d) return "—";
    return Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000));
  })();

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
          <MedCard key={m.id} m={m} />
        ))}
      </ul>
      {!viewHistory && currentMeds.length === 0 && <p style={{ color: "var(--muted)" }}>No current medicines.</p>}
      {viewHistory && historyMeds.length === 0 && <p style={{ color: "var(--muted)" }}>No history yet.</p>}
    </section>
  );
}
