import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState({ name: "", phone: "" });
  const navigate = useNavigate();

  const validate = () => {
    let valid = true;
    let newErrors = { name: "", phone: "" };

    // Nama validation
    if (!name.trim()) {
      newErrors.name = "Sila masukkan nama penuh";
      valid = false;
    }

    // Telefon validation: 10–11 digit
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone)) {
      newErrors.phone = "Sila masukkan nombor telefon sah (10-11 digit)";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === "phone_exists") {
          alert("Nombor sudah wujud. Pergi ke halaman hadir.");
          navigate("/hadir");
          return;
        }
        throw new Error("Server error");
      }

      alert("Pendaftaran berjaya!");
      setName("");
      setPhone("");
      setErrors({ name: "", phone: "" });
      navigate("/hadir");
    } catch (err) {
      alert("Ralat sambungan. Sila cuba lagi.");
      console.error(err);
    }
  };

  return (
    <div className="card">
      <h1>Daftar Pelajar</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            placeholder="Nama penuh"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
        </div>

        <div>
          <input
            type="tel"
            placeholder="No Telefon"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && <p style={{ color: "red" }}>{errors.phone}</p>}
        </div>

        <button className="button btn-green" type="submit">
          Daftar
        </button>
      </form>
    </div>
  );
}
