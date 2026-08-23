import { useEffect, useState } from "react";
import api from "../api/axiosInstance";

// The old version uploaded straight to Cloudinary from the browser with a
// public, unsigned preset and never actually linked the record to a family
// member. The upload now goes through the backend (auth + ownership checked
// before anything reaches Cloudinary), which also means a profile has to be
// picked here — the record can't exist without one.
function UploadForm() {
  const [profiles, setProfiles] = useState([]);
  const [profileId, setProfileId] = useState("");
  const [type, setType] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/profiles").then((res) => setProfiles(res.data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem', display: "grid", gap: "1rem", maxWidth: 480 }}>
      <h2>Upload Medical Record</h2>

      <div>
        <label>Family Member:</label><br />
        <select value={profileId} onChange={(e) => setProfileId(e.target.value)} required>
          <option value="">-- Select --</option>
          {profiles.map((p) => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label>Record Type:</label><br />
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="">-- Select --</option>
          <option value="Prescription">Prescription</option>
          <option value="Test Result">Test Result</option>
          <option value="Vaccination">Vaccination</option>
        </select>
      </div>

      <div>
        <label>Notes:</label><br />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Blood test result"
        />
      </div>

      <div>
        <label>Upload File (image or PDF, max 10MB):</label><br />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
      </div>

      <button type="submit" disabled={loading} style={{ width: "fit-content" }}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}

export default UploadForm;
