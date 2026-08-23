import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

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
    <div style={{ display: "grid", gap: 12 }}>
      <h2>Appointments</h2>

      {/* Add appointment */}
      <form onSubmit={addAppt} className="card" style={{ padding: 12, display: "grid", gap: 8, maxWidth: 800 }}>
        <strong>Schedule New</strong>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <select value={profileId} onChange={e=>setProfileId(e.target.value)} required>
            <option value="">Select profile</option>
            {profiles.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
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
              <li key={a._id} className="card" style={{ padding: 10, display: "grid", gap: 4 }}>
                <div style={{ fontWeight: 700 }}>{a.doctor} {a.specialty ? `• ${a.specialty}` : ""}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {a.location || "—"} • {new Date(a.date).toLocaleString()} • {profiles.find(p=>p._id===a.profileId)?.name || a.profileId}
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
