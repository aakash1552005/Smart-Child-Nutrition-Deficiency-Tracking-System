"use client";
import { Gift, TrendingUp, Users, CheckCircle2 } from "lucide-react";
import { WELFARE } from "@/lib/mock-data";

export default function SchemesPage() {
  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>Welfare Schemes</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>Scheme enrollment and coverage tracking across Karnataka</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Active Schemes", value:"5", icon:Gift, color:"#14b8a6" },
          { label:"Total Enrollments", value:"13,280", icon:Users, color:"#60a5fa" },
          { label:"Avg Coverage", value:"63.6%", icon:TrendingUp, color:"#34d399" },
        ].map(({ label, value, icon:Icon, color }) => (
          <div key={label} className="glass stat-card" style={{ borderRadius:16, padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`${color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon size={18} color={color} />
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:700, color }}>{value}</div>
                <div style={{ fontSize:12, color:"#94a3b8" }}>{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        {WELFARE.map((s) => {
          const barColor = s.pct >= 70 ? "#34d399" : s.pct >= 55 ? "#f59e0b" : "#f87171";
          const badge = s.pct >= 70 ? { text:"Good", color:"#34d399", bg:"rgba(52,211,153,0.1)" }
            : s.pct >= 55 ? { text:"Moderate", color:"#f59e0b", bg:"rgba(245,158,11,0.1)" }
            : { text:"Needs attention", color:"#f87171", bg:"rgba(248,113,113,0.1)" };
          return (
            <div key={s.name} className="glass" style={{ borderRadius:16, padding:24 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <CheckCircle2 size={16} color="#14b8a6" />
                    <h3 style={{ fontSize:15, fontWeight:600, color:"white" }}>{s.name}</h3>
                  </div>
                  <div style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>
                    {s.enrolled.toLocaleString()} enrolled of {s.eligible.toLocaleString()} eligible
                  </div>
                  <div style={{ height:8, borderRadius:4, background:"rgba(71,85,105,0.5)", maxWidth:480 }}>
                    <div style={{ height:8, borderRadius:4, width:`${s.pct}%`, background:`linear-gradient(90deg,${barColor}88,${barColor})`, transition:"width 0.7s" }} />
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:32, fontWeight:700, color:barColor }}>{s.pct}%</div>
                  <div style={{ fontSize:11, color:"#64748b" }}>coverage</div>
                  <div style={{ marginTop:6, display:"inline-block", padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:500, color:badge.color, background:badge.bg }}>{badge.text}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
