import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

// Same reasoning as Appointments: the backend lists records per profile, so
// "all my records" is profiles-fetch-then-fan-out, merged client-side.
function RecordsList() {
  const [records, setRecords] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
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
  }, []);

  const profileName = (profileId) => profiles.find((p) => p._id === profileId)?.name || "—";

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>Your Records</h2>
      {loading ? (
        <p>Loading...</p>
      ) : records.length === 0 ? (
        <p>No records found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {records.map((rec) => (
            <li key={rec._id} style={{ marginBottom: "2rem" }}>
              {rec.resourceType === "image" ? (
                <img
                  src={rec.cloudinaryUrl}
                  alt={rec.type}
                  style={{ width: "250px", borderRadius: "10px" }}
                />
              ) : (
                <a href={rec.cloudinaryUrl} target="_blank" rel="noreferrer">
                  View file
                </a>
              )}
              <p><strong>For:</strong> {profileName(rec.profileId)}</p>
              <p><strong>Type:</strong> {rec.type}</p>
              {rec.notes && <p><strong>Notes:</strong> {rec.notes}</p>}
              <p><strong>Uploaded:</strong> {new Date(rec.uploadDate).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecordsList;
