import { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import PageHeader from "./PageHeader";

// The old version uploaded straight to Cloudinary from the browser with a
// public, unsigned preset and never actually linked the record to a family
// member. The upload now goes through the backend (auth + ownership checked
// before anything reaches Cloudinary), which also means a profile has to be
// picked here — the record can't exist without one.
function UploadForm() {
  const { isDemo } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [profileId, setProfileId] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // The form (and its profile dropdown) is never rendered in demo mode,
    // so there is nothing to fetch — no authenticated request is made.
    if (isDemo) return;
    api.get("/profiles").then((res) => setProfiles(res.data));
  }, [isDemo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDemo) return;

    if (!file || !type || !profileId) {
      alert("Please select a profile, record type, and file.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("profileId", profileId);
      formData.append("type", type);
      formData.append("notes", notes);

      await api.post("/records", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Record uploaded successfully!");
      setType("");
      setNotes("");
      setFile(null);
      e.target.reset();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: "var(--space-5)" }}>
      <PageHeader title="Upload Medical Record" subtitle="Attach a prescription, test result, or vaccination record to a family member." />

      {isDemo ? (
        <div className="card" style={{ padding: "var(--space-4)", maxWidth: 480 }}>
          <p className="muted" style={{ fontSize: "var(--font-size-sm)" }}>
            Sign in to make changes.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="card" style={{ display: "grid", gap: "var(--space-3)", maxWidth: 480, padding: "var(--space-4)" }}>
          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label htmlFor="upload-profile">Family Member</label>
            <select id="upload-profile" value={profileId} onChange={(e) => setProfileId(e.target.value)} required>
              <option value="">-- Select --</option>
              {profiles.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label htmlFor="upload-type">Record Type</label>
            <select id="upload-type" value={type} onChange={(e) => setType(e.target.value)} required>
              <option value="">-- Select --</option>
              <option value="Prescription">Prescription</option>
              <option value="Test Result">Test Result</option>
              <option value="Vaccination">Vaccination</option>
            </select>
          </div>

          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label htmlFor="upload-notes">Notes</label>
            <input
              id="upload-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Blood test result"
            />
          </div>

          <div style={{ display: "grid", gap: "var(--space-1)" }}>
            <label htmlFor="upload-file">File (image or PDF, max 10MB)</label>
            <input
              id="upload-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "fit-content" }}>
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}
    </div>
  );
}

export default UploadForm;
