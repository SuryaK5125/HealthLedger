import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function RecordsList() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "records"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(data);
      } catch (err) {
        console.error("Failed to fetch records:", err);
      }
      setLoading(false);
    };

    fetchRecords();
  }, []);

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
            <li key={rec.id} style={{ marginBottom: "2rem" }}>
              <img
                src={rec.fileURL}
                alt={rec.type}
                style={{ width: "250px", borderRadius: "10px" }}
              />
              <p><strong>Type:</strong> {rec.type}</p>
              <p><strong>Notes:</strong> {rec.notes}</p>
              <p><strong>Uploaded:</strong> {rec.timestamp?.toDate?.().toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default RecordsList;
