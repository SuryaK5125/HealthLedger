import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  addDoc, collection, getDocs, orderBy, query, Timestamp, where
} from "firebase/firestore";

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

  useEffect(() => {
    (async () => {
      // load profiles for dropdown
      const ps = await getDocs(query(collection(db, "profiles"), orderBy("createdAt", "desc")));
      const plist = ps.docs.map(d => ({ id: d.id, ...d.data() }));
      setProfiles(plist);

      // upcoming appointments
      const qAppt = query(
        collection(db, "appointments"),
        where("dateTime", ">=", Timestamp.fromDate(new Date())),
        orderBy("dateTime", "asc")
      );
      const s = await getDocs(qAppt);
      setAppts(s.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, []);

  const addAppt = async (e) => {
    e.preventDefault();
    if (!profileId || !doctor || !dateStr || !timeStr) {
      alert("Profile, doctor, date, and time are required.");
      return;
    }
    const dateTime = new Date(`${dateStr}T${timeStr}:00`);
    await addDoc(collection(db, "appointments"), {
      profileId, doctor, specialty, location, notes,
      dateTime: Timestamp.fromDate(dateTime),
      status: "scheduled",
      createdAt: Timestamp.now(),
    });
    // refresh
    const qAppt = query(
      collection(db, "appointments"),
      where("dateTime", ">=", Timestamp.fromDate(new Date())),
      orderBy("dateTime", "asc")
    );
    const s = await getDocs(qAppt);
    setAppts(s.docs.map(d => ({ id: d.id, ...d.data() })));
    // reset
    setDoctor(""); setSpecialty(""); setLocation(""); setDateStr(""); setTimeStr(""); setNotes("");
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>Appointments</h2>

      {/* Add appointment */}
      <form onSubmit={addAppt} className="card" style={{ padding: 12, display: "grid", gap: 8, maxWidth: 800 }}>
        <strong>Schedule New</strong>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <select value={profileId} onChange={e=>setProfileId(e.target.value)} required>
            <option value="">Select profile</option>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <input placeholder="Doctor" value={doctor} onChange={e=>setDoctor(e.target.value)} required />
          <input placeholder="Specialty (e.g., ENT)" value={specialty} onChange={e=>setSpecialty(e.target.value)} />
          <input placeholder="Location / Hospital" value={location} onChange={e=>setLocation(e.target.value)} />
          <input type="date" value={dateStr} onChange={e=>setDateStr(e.target.value)} required />
          <input type="time" value={timeStr} onChange={e=>setTimeStr(e.target.value)} required />
          <input placeholder="Notes (optional)" value={notes} onChange={e=>setNotes(e.target.value)} />
        </div>
        <button type="submit" style={{ width: "fit-content" }}>Add</button>
      </form>

      {/* Upcoming list */}
      <section className="card" style={{ padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Upcoming</h3>
        {loading ? <p>Loading…</p> : appts.length === 0 ? <p className="muted">No upcoming appointments.</p> : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
            {appts.map(a => (
              <li key={a.id} className="card" style={{ padding: 10, display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 700 }}>{a.doctor} {a.specialty ? `• ${a.specialty}` : ""}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {a.location || "—"} • {a.dateTime?.toDate?.()?.toLocaleString?.()} • {profiles.find(p=>p.id===a.profileId)?.name || a.profileId}
                </div>
                {a.notes && <div style={{ fontSize: 12 }}>{a.notes}</div>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
