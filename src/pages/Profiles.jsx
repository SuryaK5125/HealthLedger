import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

function calcAge(dobStr) {
  if (!dobStr) return "—";
  const d = new Date(dobStr);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // add-profile form
  const [name, setName] = useState("");
  const [dob, setDob] = useState(""); // yyyy-mm-dd
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");

  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get("/profiles");
        setProfiles(res.data);
      } catch (err) {
        setError("Failed to load profiles.");
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
    try {
      const res = await api.post("/profiles", { name, dob, gender, bloodGroup });
      // Newest-first, matching what the list endpoint returns.
      setProfiles((prev) => [res.data, ...prev]);
      setName("");
      setDob("");
      setGender("");
      setBloodGroup("");
    } catch (err) {
      alert(err.response?.data?.details?.[0]?.message || err.response?.data?.message || "Failed to add profile");
    }
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
      {loading ? <p>Loading…</p> : error ? <p style={{ color: "crimson" }}>{error}</p> : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {profiles.map(p => (
            <li key={p._id} style={{ border: "1px solid #eee", borderRadius: 12, background: "#fff", padding: 12 }}>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ color: "#555", fontSize: 14 }}>
                DOB: {p.dob ? new Date(p.dob).toLocaleDateString() : "—"} • Age: {calcAge(p.dob)}
              </div>
              <div style={{ color: "#555", fontSize: 14 }}>
                Gender: {p.gender} • Blood: {p.bloodGroup}
              </div>
              <button onClick={() => nav(`/profiles/${p._id}`)} style={{ marginTop: 8 }}>
                View medicines
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
