import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Admin(){
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    if (!localStorage.getItem('adminAuth')) {
      navigate('/admin-login');
      return;
    }
    load();
  }, [navigate]);

  async function load(){
    try {
      const r1 = await fetch('/api/users'); const u = await r1.json();
      const r2 = await fetch('/api/attendance'); const a = await r2.json();
      setUsers(u||[]);
      setAttendance(a||[]);
    } catch (e) {
      console.error(e);
    }
  }

  const openEdit = (idx) => {
    setEditIdx(idx);
    setEditName(users[idx].name);
    setEditPhone(users[idx].phone);
  };

  const closeEdit = () => {
    setEditIdx(null);
    setEditName("");
    setEditPhone("");
  };

  const saveEdit = async () => {
    const copy = [...users];
    copy[editIdx].name = editName;
    copy[editIdx].phone = editPhone;
    setUsers(copy);
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(copy[editIdx])
    });
    setEditIdx(null);
  };

  const downloadCSV = () => {
    const csv = [
      ['id','userId','name','phone','day','date','time'],
      ...attendance.map(a => [a.id,a.userId,a.name,a.phone,a.day,a.date,a.time])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'attendance.csv'; a.click();
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/');
  };

  return (
    <div className="card" style={{width: '720px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20}}>
        <h1 style={{margin:0}}>Admin Panel</h1>
        <button className="button btn-orange" onClick={handleLogout} style={{padding:'8px 16px', fontSize:14}}>
          Logout
        </button>
      </div>
      <h3>Users</h3>
      <table style={{width:'100%', borderCollapse:'collapse', marginBottom:12, tableLayout:'fixed'}}>
        <thead>
          <tr><th style={{textAlign:'center', width:'50%'}}>Nama</th><th style={{textAlign:'center', width:'35%'}}>Telefon</th><th style={{textAlign:'center', width:'15%'}}>Action</th></tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.id}>
              <td style={{padding:'8px 6px', width:'50%', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis'}}>{u.name}</td>
              <td style={{padding:'8px 6px', width:'35%', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis'}}>{u.phone}</td>
              <td style={{padding:'8px 6px', width:'15%', textAlign:'center'}}>
                <button className="button btn-orange" style={{padding:'4px 12px', fontSize:14}} onClick={()=>openEdit(idx)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Kehadiran</h3>
      <table style={{width:'100%', borderCollapse:'collapse', marginBottom:12, tableLayout:'fixed'}}>
        <thead><tr><th style={{textAlign:'center', width:'20%'}}>Nama</th><th style={{textAlign:'center', width:'20%'}}>Telefon</th><th style={{textAlign:'center', width:'15%'}}>Hari</th><th style={{textAlign:'center', width:'22%'}}>Tarikh</th><th style={{textAlign:'center', width:'23%'}}>Masa</th></tr></thead>
        <tbody>
          {attendance.map(a => (
            <tr key={a.id}>
              <td style={{padding:'6px', width:'20%', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis'}}>{a.name}</td>
              <td style={{padding:'6px', width:'20%', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis'}}>{a.phone}</td>
              <td style={{padding:'6px', width:'15%', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis'}}>{a.day}</td>
              <td style={{padding:'6px', width:'22%', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis'}}>{a.date}</td>
              <td style={{padding:'6px', width:'23%', textAlign:'center', overflow:'hidden', textOverflow:'ellipsis'}}>{a.time}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{marginTop:12}}>
        <button className="button btn-green" onClick={downloadCSV}>Download CSV</button>
      </div>

      {/* Edit Modal */}
      {editIdx !== null && (
        <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'rgba(0,0,0,0.3)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
          <div style={{background:'#fffbea',border:'4px solid #111',borderRadius:10,padding:32,minWidth:350,boxShadow:'0 4px 8px rgba(0,0,0,0.2)'}}>
            <h2 style={{marginTop:0}}>Edit User</h2>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',marginBottom:6,fontWeight:600}}>Nama</label>
              <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} style={{width:'100%',padding:10,fontSize:16,border:'2px solid #ddd',borderRadius:6,boxSizing:'border-box'}} />
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:'block',marginBottom:6,fontWeight:600}}>Telefon</label>
              <input type="tel" value={editPhone} onChange={e=>setEditPhone(e.target.value)} style={{width:'100%',padding:10,fontSize:16,border:'2px solid #ddd',borderRadius:6,boxSizing:'border-box'}} />
            </div>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button className="button btn-green" style={{padding:'8px 18px',fontSize:14}} onClick={saveEdit}>Save</button>
              <button className="button btn-orange" style={{padding:'8px 18px',fontSize:14}} onClick={closeEdit}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
