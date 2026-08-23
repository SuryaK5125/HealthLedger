import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import { demoProfiles } from "../data/demoData";

function calcAge(dobStr) {
  if (!dobStr) return "—";
  const d = new Date(dobStr);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
}

export default function Profiles() {
  const { isDemo } = useAuth();
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
    if (isDemo) {
      setProfiles(demoProfiles);
      setLoading(false);
      return;
    }
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
  }, [isDemo]);

  const addProfile = async (e) => {
    e.preventDefault();
    if (isDemo) return;
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
    <section style={{ display: "grid", gap: "var(--space-5)" }}>
      <PageHeader title="Profiles" subtitle="Manage the family members whose health records live in HealthLedger." />

      {/* Add Profile — a mutation form, so it's hidden entirely in demo mode
          rather than shown disabled; the persistent navbar indicator already
          makes the read-only state clear. */}
      {!isDemo && (
        <form onSubmit={addProfile} className="card" style={{ display: "grid", gap: "var(--space-3)", maxWidth: 720, padding: "var(--space-4)" }}>
          <strong style={{ fontSize: "var(--font-size-lg)" }}>Add Family Member</strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-3)" }}>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <label htmlFor="profile-name">Full name</label>
              <input id="profile-name" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <label htmlFor="profile-dob">Date of birth</label>
              <input id="profile-dob" type="date" value={dob} onChange={e=>setDob(e.target.value)} required />
            </div>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <label htmlFor="profile-gender">Gender</label>
              <select id="profile-gender" value={gender} onChange={e=>setGender(e.target.value)} required>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div style={{ display: "grid", gap: "var(--space-1)" }}>
              <label htmlFor="profile-blood">Blood group</label>
              <select id="profile-blood" value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)} required>
                <option value="">Select</option>
                {["A+","A-","B+","B-","O+","O-","AB+","AB-"].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ width: "fit-content" }}>Add Profile</button>
        </form>
      )}

      {/* List */}
      {loading ? (
        <p className="muted">Loading…</p>
      ) : error ? (
        <p style={{ color: "var(--danger)" }}>{error}</p>
      ) : profiles.length === 0 ? (
        <EmptyState title="No family members yet" message="Add your first profile above to start tracking medications, records and appointments." />
      ) : (
        <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--space-3)", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
          {profiles.map(p => (
            <li key={p._id} className="card" style={{ padding: "var(--space-4)", display: "grid", gap: "var(--space-2)" }}>
              <div style={{ fontWeight: 700, fontSize: "var(--font-size-lg)" }}>{p.name}</div>
              <div className="muted" style={{ fontSize: "var(--font-size-sm)" }}>
                {p.dob ? new Date(p.dob).toLocaleDateString() : "—"} • Age {calcAge(p.dob)}
              </div>
              <div style={{ display: "flex", gap: "var(--space-1)", flexWrap: "wrap" }}>
                {p.relationship && <span className="badge">{p.relationship}</span>}
                <span className="badge">{p.gender}</span>
                <span className="badge">{p.bloodGroup}</span>
              </div>
              <button onClick={() => nav(`/profiles/${p._id}`)} style={{ marginTop: "var(--space-1)", width: "fit-content" }}>
                View medicines
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
