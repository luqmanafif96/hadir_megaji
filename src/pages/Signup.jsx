import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup(){
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!name.trim() || !phone.trim()){
      alert("Sila isi nama & nombor telefon");
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ name, phone })
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'phone_exists') {
          alert('Nombor sudah wujud. Pergi ke halaman hadir.');
          navigate('/hadir');
          return;
        }
        throw new Error('Server error');
      }
      alert('Pendaftaran berjaya!');
      setName(''); setPhone('');
      navigate('/hadir');
    } catch (err) {
      alert('Ralat sambungan. Sila cuba lagi.');
      console.error(err);
    }
  };

  return (
    <div className="card">
      <h1>Daftar Pelajar</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nama penuh" value={name} onChange={e=>setName(e.target.value)} />
        <input type="tel" placeholder="No Telefon" value={phone} onChange={e=>setPhone(e.target.value)} />
        <button className="button btn-green" type="submit">Daftar</button>
      </form>
    </div>
  );
}
