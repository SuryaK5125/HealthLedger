import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

function UploadForm() {
  const [type, setType] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!file || !type) {
    alert("Please select a file and record type.");
    return;
  }

  setLoading(true);

  try {
    // 1. Upload file to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "healthvault_unsigned");

    const response = await fetch("https://api.cloudinary.com/v1_1/ddejxefg5/image/upload", {
      method: "POST",
      body: formData,
    });

    const fileData = await response.json();

    if (!response.ok) {
      throw new Error(fileData.error?.message || "Cloudinary upload failed");
    }

    // 2. Save record to Firestore with Cloudinary URL
    await addDoc(collection(db, "records"), {
      type,
      notes,
      fileURL: fileData.secure_url,
      timestamp: Timestamp.now(),
    });

    console.log("🔥 Record saved to Firestore");
    alert("Record uploaded successfully!");
  } catch (err) {
    console.error("❌ Upload failed:", err);
    alert("Something went wrong — check console.");
  }

  setLoading(false);
};


  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
      <h2>Upload Medical Record</h2>

      <div>
        <label>Record Type:</label><br />
        <select value={type} onChange={(e) => setType(e.target.value)} required>
          <option value="">-- Select --</option>
          <option value="Prescription">Prescription</option>
          <option value="Test Result">Test Result</option>
          <option value="Vaccination">Vaccination</option>
        </select>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>Notes:</label><br />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Blood test result"
        />
      </div>

      <div style={{ marginTop: '1rem' }}>
        <label>Upload File:</label><br />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} required />
      </div>

      <button type="submit" style={{ marginTop: '1rem' }} disabled={loading}>
        {loading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}

export default UploadForm;
