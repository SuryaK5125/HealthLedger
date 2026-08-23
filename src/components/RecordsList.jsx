import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import PageHeader from "./PageHeader";
import EmptyState from "./EmptyState";
import { demoProfiles, demoRecords } from "../data/demoData";

// Same reasoning as Appointments: the backend lists records per profile, so
// "all my records" is profiles-fetch-then-fan-out, merged client-side.
function RecordsList() {
  const { isDemo } = useAuth();
  const [records, setRecords] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (isDemo) {
          setProfiles(demoProfiles);
          const sorted = [...demoRecords].sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
          setRecords(sorted);
          return;
        }

        const profilesRes = await api.get("/profiles");
        setProfiles(profilesRes.data);

        const results = await Promise.all(
          profilesRes.data.map((p) => api.get("/records", { params: { profileId: p._id } }))
        );
        const merged = results
          .flatMap((res) => res.data)
          .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        setRecords(merged);
      } catch (err) {
        console.error("Failed to fetch records:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isDemo]);

  const profileName = (profileId) => profiles.find((p) => p._id === profileId)?.name || "—";

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <PageHeader title="Records" subtitle="Prescriptions, test results and vaccination records, all in one place." />

      {loading ? (
        <p className="muted">Loading...</p>
      ) : records.length === 0 ? (
        <EmptyState title="No records yet" message="Upload a prescription, test result, or vaccination record to see it here." />
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "grid",
            gap: "var(--space-3)",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          }}
        >
          {records.map((rec) => (
            <li key={rec._id} className="card" style={{ overflow: "hidden", display: "grid" }}>
              {rec.resourceType === "image" && rec.cloudinaryUrl ? (
                <img
                  src={rec.cloudinaryUrl}
                  alt={rec.type}
                  style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                />
              ) : rec.cloudinaryUrl ? (
                <a
                  href={rec.cloudinaryUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    height: 160,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--space-2)",
                    background: "var(--accent)",
                    color: "var(--accentText)",
                    fontWeight: 700,
                  }}
                >
                  <span className="badge">File</span>
                  View file
                </a>
              ) : (
                // No file URL at all — this is a sample/demo record, not a
                // real upload. Render a static, non-interactive file card
                // rather than a link that would point nowhere.
                <div
                  style={{
                    height: 160,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "var(--space-2)",
                    background: "var(--accent)",
                    color: "var(--accentText)",
                    fontWeight: 700,
                  }}
                >
                  <span className="badge">Sample</span>
                  Document
                </div>
              )}
              <div style={{ padding: "var(--space-3)", display: "grid", gap: "var(--space-1)" }}>
                <div style={{ fontWeight: 700 }}>{rec.type}</div>
                <div className="muted" style={{ fontSize: "var(--font-size-sm)" }}>{profileName(rec.profileId)}</div>
                {rec.notes && <div style={{ fontSize: "var(--font-size-sm)" }}>{rec.notes}</div>}
                <div className="muted" style={{ fontSize: "var(--font-size-xs)" }}>
                  {new Date(rec.uploadDate).toLocaleString()}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecordsList;
