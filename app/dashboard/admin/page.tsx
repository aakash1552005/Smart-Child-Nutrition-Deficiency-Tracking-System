"use client";
export default function Page() {
  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>Admin Panel</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>System configuration and data management</p>
      <div className="glass" style={{ borderRadius:16, padding:32, textAlign:"center" }}>
        <div style={{ fontSize:48, marginBottom:16 }}>🚧</div>
        <div style={{ color:"white", fontWeight:600, marginBottom:8 }}>Coming Soon</div>
        <div style={{ color:"#64748b", fontSize:13 }}>This section is under development.</div>
      </div>
    </div>
  );
}
