import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, Timestamp, orderBy, query } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function calcAge(dobTs) {
  const d = dobTs?.toDate?.();
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // add-profile form
  const [name, setName] = useState("");
  const [dob, setDob] = useState(""); // yyyy-mm-dd
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        setProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const addProfile = async (e) => {
    e.preventDefault();
    if (!name || !dob || !gender || !bloodGroup) {
      alert("Fill all fields");
      return;
    }
    await addDoc(collection(db, "profiles"), {
      name,
      dob: Timestamp.fromDate(new Date(dob)),
      gender,
      bloodGroup,
      createdAt: Timestamp.now(),
    });

    // refresh list
    const q = query(collection(db, "profiles"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setProfiles(snap.docs.map(d => ({ id: d.id, ...d.data() })));

    // reset form
    setName(""); setDob(""); setGender(""); setBloodGroup("");
  };

  return (
    <section style={{ marginTop: "1rem", display: "grid", gap: "1rem" }}>
      <h2>Profiles</h2>

      {/* Add Profile */}
      <form onSubmit={addProfile} style={{ display: "grid", gap: 8, maxWidth: 720, padding: 12, background: "#fff", border: "1px solid #eee", borderRadius: 12 }}>
        <strong>Add Family Member</strong>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <input placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} required />
          <input type="date" value={dob} onChange={e=>setDob(e.target.value)} required />
          <select value={gender} onChange={e=>setGender(e.target.value)} required>
            <option value="">Gender</option>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
          <select value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)} required>
            <option value="">Blood Group</option>
            {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}
          </select>
        </div>
        <button type="submit" style={{ width: "fit-content" }}>Add Profile</button>
      </form>

      {/* List */}
      {loading ? <p>Loading…</p> : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {profiles.map(p => (
            <li key={p.id} style={{ border: "1px solid #eee", borderRadius: 12, background: "#fff", padding: 12 }}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ color: "#555", fontSize: 14 }}>
                DOB: {p.dob?.toDate?.().toLocaleDateString?.() || "—"} • Age: {calcAge(p.dob)}
              </div>
              <div style={{ color: "#555", fontSize: 14 }}>
                Gender: {p.gender} • Blood: {p.bloodGroup}
              </div>
              <button onClick={() => nav(`/profiles/${p.id}`)} style={{ marginTop: 8 }}>
                View medicines
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
