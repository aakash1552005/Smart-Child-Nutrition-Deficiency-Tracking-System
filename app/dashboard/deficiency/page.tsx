"use client";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Microscope, AlertTriangle } from "lucide-react";

const RADAR = [
  { subject: "Vitamin A", value: 15.2 },
  { subject: "Iron", value: 13.8 },
  { subject: "Underweight", value: 4.1 },
  { subject: "Wasting", value: 2.3 },
  { subject: "Stunting", value: 1.8 },
];

const DETAILS = [
  { indicator: "Vitamin A Deficiency", affected: 760, pct: 15.2, color: "#ec4899", severity: "Moderate", trend: "↓ 2.1% vs last month" },
  { indicator: "Iron Deficiency", affected: 690, pct: 13.8, color: "#8b5cf6", severity: "Moderate", trend: "↓ 0.8% vs last month" },
  { indicator: "Underweight", affected: 205, pct: 4.1, color: "#3b82f6", severity: "Low", trend: "↓ 1.2% vs last month" },
  { indicator: "Wasting", affected: 115, pct: 2.3, color: "#f59e0b", severity: "Low", trend: "↑ 0.3% vs last month" },
  { indicator: "Stunting", affected: 90, pct: 1.8, color: "#ef4444", severity: "Low", trend: "↓ 0.5% vs last month" },
];

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", border:"1px solid rgba(148,163,184,0.15)", borderRadius:8, padding:"8px 12px", fontSize:12 }}>
      <div style={{ color:"white", fontWeight:600 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ color:"#94a3b8" }}>{p.name}: <span style={{ color:"white" }}>{p.value}%</span></div>
      ))}
    </div>
  );
};

export default function DeficiencyPage() {
  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>Deficiency Detection</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>AI-predicted micronutrient and growth deficiency analysis</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div className="glass" style={{ borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>Deficiency Radar</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={RADAR}>
              <PolarGrid stroke="rgba(148,163,184,0.1)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize:11, fill:"#94a3b8" }} />
              <Radar name="Prevalence %" dataKey="value" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} strokeWidth={2} />
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background:"#1e293b", border:"none", borderRadius:8, fontSize:12 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass" style={{ borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>Prevalence Breakdown</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={RADAR} layout="vertical">
              <XAxis type="number" tick={{ fontSize:10 }} domain={[0,20]} />
              <YAxis type="category" dataKey="subject" tick={{ fontSize:11, fill:"#94a3b8" }} width={80} />
              <Tooltip content={<TT />} />
              <Bar dataKey="value" name="Prevalence %" fill="#14b8a6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        {DETAILS.map((d) => (
          <div key={d.indicator} className="glass" style={{ borderRadius:16, padding:20, borderLeft:`3px solid ${d.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:8, background:`${d.color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Microscope size={16} color={d.color} />
              </div>
              <span style={{ fontSize:11, padding:"2px 8px", borderRadius:999, fontWeight:500,
                color: d.severity==="Moderate" ? "#fbbf24" : "#34d399",
                background: d.severity==="Moderate" ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)" }}>
                {d.severity}
              </span>
            </div>
            <div style={{ fontSize:24, fontWeight:700, color:"white" }}>{d.affected}</div>
            <div style={{ fontSize:12, color:"#94a3b8", marginTop:2, marginBottom:8 }}>{d.indicator}</div>
            <div style={{ height:4, borderRadius:2, background:"rgba(71,85,105,0.5)", marginBottom:8 }}>
              <div style={{ height:4, borderRadius:2, width:`${(d.pct/16)*100}%`, background:d.color }} />
            </div>
            <div style={{ fontSize:11, fontWeight:500, color: d.trend.startsWith("↓") ? "#34d399" : "#f87171" }}>{d.trend}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ borderRadius:16, padding:20, display:"flex", alignItems:"flex-start", gap:12, border:"1px solid rgba(236,72,153,0.2)", background:"rgba(236,72,153,0.04)" }}>
        <AlertTriangle size={16} color="#ec4899" style={{ flexShrink:0, marginTop:2 }} />
        <p style={{ fontSize:13, color:"#cbd5e1" }}>
          <strong style={{ color:"#ec4899" }}>Vitamin A & Iron deficiency</strong> are the most prevalent micronutrient deficiencies.
          Districts with highest prevalence: <strong style={{ color:"white" }}>Kalaburagi, Raichur, Vijayapura</strong>. Targeted supplementation programmes recommended.
        </p>
      </div>
    </div>
  );
}
