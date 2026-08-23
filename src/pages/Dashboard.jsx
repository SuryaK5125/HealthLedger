import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import EmptyState from "../components/EmptyState";

function Section({ title, action, children }) {
  return (
    <section className="card" style={{ padding: "var(--space-4)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
        <h3 style={{ margin: 0, fontSize: "var(--font-size-lg)" }}>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
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

  if (loading) return <p style={{ marginTop: "var(--space-4)" }}>Loading…</p>;

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <PageHeader
        title="Dashboard"
        subtitle={
          user?.name
            ? `Welcome back, ${user.name.split(" ")[0]}. Here's what's happening across your family's health records.`
            : "Here's what's happening across your family's health records."
        }
      />

      {/* Key stats */}
      <div style={{ display: "grid", gap: "var(--space-3)", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <StatCard label="Profiles" value={stats.totalProfiles} to="/profiles" linkLabel="Manage profiles" />
        <StatCard label="Current Medications" value={currentMedCount} />
        <StatCard label="Uploads (7d)" value={stats.uploadsLast7} to="/records" linkLabel="View records" />
        <StatCard label="Next Appointment" value={stats.nextAppt} to="/appointments" linkLabel="Open schedule" />
      </div>

      {/* Recent activity + upcoming appointments side by side */}
      <div style={{ display: "grid", gap: "var(--space-3)", gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)" }}>
        <Section title="Recent Activity" action={<Link to="/records" style={{ fontSize: "var(--font-size-sm)" }}>View all →</Link>}>
          {recentRecords.length === 0 ? (
            <EmptyState title="No recent uploads" message="Records uploaded in the last 7 days will show up here." />
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--space-2)" }}>
              {recentRecords.map((rec) => (
                <li
                  key={rec._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "var(--space-2) var(--space-3)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{rec.type || "Record"}</div>
                    <div className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                      {profileName(rec.profileId)} • {new Date(rec.uploadDate).toLocaleString()}
                    </div>
                  </div>
                  <span className="badge">Uploaded</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Upcoming Appointments" action={<Link to="/appointments" style={{ fontSize: "var(--font-size-sm)" }}>View all →</Link>}>
          {upcomingAppts.length === 0 ? (
            <EmptyState title="Nothing scheduled" message="Upcoming appointments will appear here." />
          ) : (
            <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "var(--space-2)" }}>
              {upcomingAppts.slice(0, 5).map((a) => (
                <li
                  key={a._id}
                  style={{
                    padding: "var(--space-2) var(--space-3)",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{a.doctor}{a.specialty ? ` • ${a.specialty}` : ""}</div>
                  <div className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                    {profileName(a.profileId)} • {new Date(a.date).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* Family profiles strip */}
      <Section title="Family Profiles" action={<Link to="/profiles" style={{ fontSize: "var(--font-size-sm)" }}>Manage →</Link>}>
        {profiles.length === 0 ? (
          <EmptyState title="No family members yet" message="Add a profile to start tracking medications, records and appointments." />
        ) : (
          <div style={{ display: "flex", gap: "var(--space-2)", overflowX: "auto", paddingBottom: "var(--space-1)" }}>
            {profiles.map((p) => (
              <Link
                key={p._id}
                to={`/profiles/${p._id}`}
                style={{
                  minWidth: 160,
                  padding: "var(--space-3)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--text)",
                  textDecoration: "none",
                }}
              >
                <div style={{ fontWeight: 700 }}>{p.name}</div>
                <div className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  {p.gender} • {p.bloodGroup}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
