import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import {
  collection, getDocs, query, orderBy, limit, where, Timestamp
} from "firebase/firestore";
import { Link } from "react-router-dom";

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
  const [reminders, setReminders] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [upcomingAppts, setUpcomingAppts] = useState([]);

  useEffect(() => {
    (async () => {
      // Profiles
      const ps = await getDocs(query(collection(db, "profiles"), orderBy("createdAt", "desc")));
      setProfiles(ps.docs.map(d => ({ id: d.id, ...d.data() })));

      // Reminders (next 7 days & not done)
      const now = new Date();
      const in7 = new Date(Date.now() + 7 * 24 * 3600 * 1000);
      const remQ = query(
        collection(db, "reminders"),
        where("dueDate", ">=", Timestamp.fromDate(now)),
        where("dueDate", "<=", Timestamp.fromDate(in7)),
        where("done", "==", false),
        orderBy("dueDate", "asc"),
        limit(10)
      );
      const rs = await getDocs(remQ);
      setReminders(rs.docs.map(d => ({ id: d.id, ...d.data() })));

      // Recent activity: last uploads (records) in 7 days
      const sevenDaysAgo = Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 3600 * 1000));
      const recQ = query(
        collection(db, "records"),
        where("timestamp", ">=", sevenDaysAgo),
        orderBy("timestamp", "desc"),
        limit(8)
      );
      const r = await getDocs(recQ);
      setRecentRecords(r.docs.map(d => ({ id: d.id, ...d.data() })));

      // Appointments upcoming
      const apptQ = query(
        collection(db, "appointments"),
        where("dateTime", ">=", Timestamp.fromDate(new Date())),
        orderBy("dateTime", "asc"),
        limit(5)
      );
      const a = await getDocs(apptQ);
      setUpcomingAppts(a.docs.map(d => ({ id: d.id, ...d.data() })));
    })();
  }, []);

  const stats = useMemo(() => {
    const totalProfiles = profiles.length;
    const totalCurrentMeds = "—"; // optional: compute by querying each profile’s medications where ongoing==true
    const uploadsLast7 = recentRecords.length;
    const nextAppt = upcomingAppts[0]?.dateTime?.toDate?.()?.toLocaleString?.() || "—";
    return { totalProfiles, totalCurrentMeds, uploadsLast7, nextAppt };
  }, [profiles, recentRecords, upcomingAppts]);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <h2>Dashboard</h2>

      {/* Key stats */}
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Section title="Profiles">
          <div style={{ fontSize: 28, fontWeight: 700 }}>{stats.totalProfiles}</div>
          <Link to="/profiles" className="muted">Manage profiles →</Link>
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

      {/* Reminders */}
      <Section title="Upcoming Reminders (7 days)">
        {reminders.length === 0 ? <div className="muted">No reminders due soon.</div> : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
            {reminders.map(r => (
              <li key={r.id} className="card" style={{ padding: 8, display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.title}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    {r.type} • {r.dueDate?.toDate?.()?.toLocaleString?.()} • {r.profileId || "—"}
                  </div>
                </div>
                <span className="badge">Due</span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Recent Activity */}
      <Section title="Recent Activity">
        {recentRecords.length === 0 ? <div className="muted">No recent uploads.</div> : (
          <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
            {recentRecords.map(rec => (
              <li key={rec.id} className="card" style={{ padding: 8 }}>
                <div style={{ fontWeight: 600 }}>{rec.type || "Record"}</div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {(rec.forWho || "—")} • {rec.timestamp?.toDate?.()?.toLocaleString?.()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
