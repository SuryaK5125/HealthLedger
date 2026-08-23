import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";

function Section({ title, children }) {
  return (
    <section className="card" style={{ padding: 12 }}>
      <h3 style={{ margin: "0 0 8px" }}>{title}</h3>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const [profiles, setProfiles] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [upcomingAppts, setUpcomingAppts] = useState([]);
  const [currentMedCount, setCurrentMedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const profilesRes = await api.get("/profiles");
      const profileList = profilesRes.data;
      setProfiles(profileList);

      // The backend scopes appointments/records/medications lists to one
      // profile at a time, so a dashboard summarising "everything" fans out
      // one request per profile and merges the results here.
      const [apptResults, recordResults, medResults] = await Promise.all([
        Promise.all(profileList.map((p) => api.get("/appointments", { params: { profileId: p._id } }))),
        Promise.all(profileList.map((p) => api.get("/records", { params: { profileId: p._id } }))),
        Promise.all(profileList.map((p) => api.get("/medications", { params: { profileId: p._id } }))),
      ]);

      const now = Date.now();
      const upcoming = apptResults
        .flatMap((r) => r.data)
        .filter((a) => new Date(a.date).getTime() >= now)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setUpcomingAppts(upcoming);

      const sevenDaysAgo = now - 7 * 24 * 3600 * 1000;
      const recent = recordResults
        .flatMap((r) => r.data)
        .filter((rec) => new Date(rec.uploadDate).getTime() >= sevenDaysAgo)
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      setRecentRecords(recent);

      const currentMeds = medResults.flatMap((r) => r.data).filter((m) => !m.endDate);
      setCurrentMedCount(currentMeds.length);

      setLoading(false);
    })();
  }, []);

  const profileName = (profileId) => profiles.find((p) => p._id === profileId)?.name || "—";

  const stats = useMemo(() => {
    const totalProfiles = profiles.length;
    const uploadsLast7 = recentRecords.length;
    const nextAppt = upcomingAppts[0] ? new Date(upcomingAppts[0].date).toLocaleString() : "—";
    return { totalProfiles, uploadsLast7, nextAppt };
  }, [profiles, recentRecords, upcomingAppts]);

  if (loading) return <p style={{ marginTop: "1rem" }}>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>Dashboard</h2>

      {/* Key stats */}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Section title="Profiles">
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalProfiles}</div>
          <Link to="/profiles" className="muted">Manage profiles →</Link>
        </Section>
        <Section title="Current Medications">
          <div style={{ fontSize: 28, fontWeight: 700 }}>{currentMedCount}</div>
        </Section>
        <Section title="Uploads (7d)">
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.uploadsLast7}</div>
          <Link to="/records" className="muted">View records →</Link>
        </Section>
        <Section title="Next appointment">
          <div style={{ fontSize: 20 }}>{stats.nextAppt}</div>
          <Link to="/appointments" className="muted">Open schedule →</Link>
        </Section>
      </div>

      {/* Recent Activity */}
      <Section title="Recent Activity">
        {recentRecords.length === 0 ? <div className="muted">No recent uploads.</div> : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
            {recentRecords.map(rec => (
              <li key={rec._id} className="card" style={{ padding: 8 }}>
                <div style={{ fontWeight: 600 }}>{rec.type || "Record"}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {profileName(rec.profileId)} • {new Date(rec.uploadDate).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
