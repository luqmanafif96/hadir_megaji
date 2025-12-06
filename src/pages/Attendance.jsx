import { React, useState } from "react";
import { useNavigate } from "react-router-dom";

function todayInfo() {
  const now = new Date();
  return {
    dayName: now.toLocaleDateString("en-US", { weekday: "long" }),
    date: now.toISOString().slice(0, 10),
    time: now.toTimeString().slice(0, 8),
  };
}

export default function Attendance() {
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(""); // <- untuk validation message
  const navigate = useNavigate();

  const validatePhone = (value) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation sebelum fetch
    if (!validatePhone(phone)) {
      setError("Sila masukkan nombor telefon sah (10-11 digit)");
      return;
    } else {
      setError(""); // clear error
    }

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "not_found") {
          navigate("/notfound");
          return;
        }
        throw new Error("Server error");
      }
      setSuccess(true);
      setTimeout(() => {
        setPhone("");
        setSuccess(false);
      }, 2000);
    } catch (err) {
      alert("Ralat sambungan. Sila cuba lagi.");
      console.error(err);
    }
  };

  const now = new Date();
  const pretty = now.toLocaleDateString("ms-MY", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const currentTime = now.toTimeString().slice(0, 5);

  return (
    <div className="card">
      <h1>Ambil Kehadiran</h1>

      <div
        style={{
          background: "#e8f5e9",
          border: "2px solid #2e8b57",
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <p style={{ margin: "8px 0", fontSize: 14, color: "#333" }}>
          <strong>📅 Tarikh:</strong> {pretty}
        </p>
        <p style={{ margin: "8px 0", fontSize: 14, color: "#333" }}>
          <strong>🕐 Masa Kelas:</strong> 19:00 - 21:00
        </p>
        <p style={{ margin: "8px 0", fontSize: 14, color: "#333" }}>
          <strong>📌 Hari Kelas:</strong> Isnin, Rabu, Jumaat
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label
            style={{ display: "block", marginBottom: 8, fontWeight: 600, fontSize: 14 }}
          >
            No Telefon
          </label>
          <input
            type="tel"
            placeholder="Masukkan No Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {error && <p style={{ color: "red", marginTop: 4 }}>{error}</p>}
        </div>
        <button className="button btn-green" type="submit">
          {success ? "✓ Kehadiran Direkod!" : "Hadir"}
        </button>
      </form>

      {success && (
        <div
          style={{
            marginTop: 16,
            padding: 12,
            background: "#c8e6c9",
            border: "2px solid #2e8b57",
            borderRadius: 6,
            textAlign: "center",
            color: "#1b5e20",
            fontWeight: 600,
          }}
        >
          Kehadiran anda telah direkod. Terima kasih!
        </div>
      )}
    </div>
  );
}
