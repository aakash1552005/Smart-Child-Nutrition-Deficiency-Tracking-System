"use client";
import { Settings, Database, Users, Download, RefreshCw, Shield } from "lucide-react";

const ACTIONS = [
  { icon:RefreshCw, label:"Sync Data from Supabase", desc:"Pull latest records from the database", color:"#14b8a6" },
  { icon:Download, label:"Export Full Dataset", desc:"Download all 5,000 records as CSV", color:"#60a5fa" },
  { icon:Users, label:"Manage Users", desc:"Add, edit, or deactivate portal users", color:"#c084fc" },
  { icon:Shield, label:"Audit Log", desc:"View system access and change history", color:"#f59e0b" },
  { icon:Database, label:"Supabase Console", desc:"Open the database management console", color:"#34d399" },
  { icon:Settings, label:"System Settings", desc:"Configure thresholds, alerts, and integrations", color:"#f87171" },
];

export default function AdminPage() {
  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>Admin Panel</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>System configuration and data management</p>

      <div className="glass" style={{ borderRadius:16, padding:20, marginBottom:20 }}>
        <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>System Status</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
          {[
            { label:"Database", status:"Connected", ok:true },
            { label:"ML Models", status:"6 Active", ok:true },
            { label:"API Backend", status:"Online", ok:true },
            { label:"Last Sync", status:"Just now", ok:true },
          ].map(({ label, status, ok }) => (
            <div key={label} style={{ textAlign:"center" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:999, fontSize:11, fontWeight:500, marginBottom:4,
                color: ok ? "#34d399" : "#f87171", background: ok ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)" }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background: ok ? "#34d399" : "#f87171" }} />
                {status}
              </div>
              <div style={{ fontSize:11, color:"#64748b" }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass" style={{ borderRadius:16, padding:20, marginBottom:20 }}>
        <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>Environment</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {[
            ["Framework","Next.js 14"],
            ["Database","Supabase (PostgreSQL)"],
            ["Deployment","Vercel"],
            ["CI/CD","GitHub Actions"],
            ["ML Backend","FastAPI + XGBoost + LightGBM"],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex", alignItems:"center", gap:12, fontFamily:"monospace", fontSize:12 }}>
              <span style={{ color:"#64748b", width:120 }}>{k}</span>
              <span style={{ color:"#94a3b8" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
        {ACTIONS.map(({ icon:Icon, label, desc, color }) => (
          <button key={label} className="glass stat-card"
            style={{ borderRadius:16, padding:20, textAlign:"left", border:"1px solid rgba(148,163,184,0.08)", cursor:"pointer", width:"100%", background:"none" }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${color}20`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
              <Icon size={18} color={color} />
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:4 }}>{label}</div>
            <div style={{ fontSize:11, color:"#64748b" }}>{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
