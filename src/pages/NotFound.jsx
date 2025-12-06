import React from "react";
import { Link } from "react-router-dom";

export default function NotFound(){
  return (
    <div className="card">
      <h1>No Telefon Tak Dijumpai</h1>
      <p style={{fontSize:18}}>
        Maaf, nombor telefon anda belum didaftarkan dalam sistem.
        Sila daftar dahulu untuk ambil kehadiran kelas mengaji.
      </p>

      <Link to="/daftar" className="button btn-orange" style={{marginTop:20}}>Daftar Sekarang</Link>
    </div>
  );
}
