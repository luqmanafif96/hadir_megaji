import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin(){
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple password check (you can change 'admin123' to your desired password)
    if (password === 'admin123') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin');
    } else {
      setError('Password salah');
      setTimeout(() => setError(""), 2000);
    }
  };

  return (
    <div className="card">
      <h1>Admin Login</h1>
      <form onSubmit={handleSubmit}>
        <div style={{marginBottom:16}}>
          <label style={{display:'block', marginBottom:8, fontWeight:600, fontSize:14}}>Password</label>
          <input 
            type="password" 
            placeholder="Masukkan password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)}
          />
        </div>
        <button className="button btn-green" type="submit">
          Login
        </button>
      </form>

      {error && (
        <div style={{marginTop:16, padding:12, background:'#ffcdd2', border:'2px solid #d32f2f', borderRadius:6, textAlign:'center', color:'#b71c1c', fontWeight:600}}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
