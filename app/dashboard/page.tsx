"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Users, CheckCircle2, Zap, Target, TrendingDown } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { MOCK_STATS, DISTRICT_DATA, RISK_PIE, INDICATORS, FORECAST } from "@/lib/mock-data";

const CARDS = [
  { label:"Total Children", value:"5,000", sub:"+ 234 this month", icon:Users, color:"#60a5fa" },
  { label:"Healthy (Low Risk)", value:"4,215", sub:"84.3% of total", icon:CheckCircle2, color:"#34d399" },
  { label:"Medium Risk", value:"719", sub:"Needs monitoring", icon:Zap, color:"#fbbf24" },
  { label:"High Risk", value:"66", sub:"Immediate action", icon:AlertTriangle, color:"#f87171" },
  { label:"Scheme Coverage", value:"65.7%", sub:"+ 3.2% vs last month", icon:Target, color:"#c084fc" },
];

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", border:"1px solid rgba(148,163,184,0.15)", borderRadius:8, padding:"8px 12px", fontSize:12 }}>
      <div style={{ color:"white", fontWeight:600, marginBottom:4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }} />
          <span style={{ color:"#94a3b8" }}>{p.name}:</span>
          <span style={{ color:"white" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 60000); return () => clearInterval(t); }, []);

  return (
    <div style={{ padding:24 }} className="animate-fade-in">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:"white" }}>Executive Overview</h1>
          <p style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>Real-time child nutrition analytics across Karnataka</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:11, color:"#64748b" }}>Last updated</div>
          <div style={{ fontSize:13, fontFamily:"monospace", color:"#cbd5e1", marginTop:2 }}>
            {now.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })} · {now.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
          </div>
        </div>
      </div>

      <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", borderRadius:12, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", marginBottom:24 }}>
        <AlertTriangle size={16} color="#ef4444" style={{ flexShrink:0 }} />
        <p style={{ fontSize:13, color:"#cbd5e1" }}>
          <strong style={{ color:"#f87171" }}>66 children</strong> classified as High Risk require immediate intervention across 10 districts.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:16, marginBottom:24 }}>
        {CARDS.map(({ label, value, sub, icon:Icon, color }) => (
          <div key={label} className="stat-card glass" style={{ borderRadius:16, padding:20, borderTop:`2px solid ${color}` }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`${color}22`, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:12 }}>
              <Icon size={16} color={color} />
            </div>
            <div style={{ fontSize:22, fontWeight:700, color }}>{value}</div>
            <div style={{ fontSize:11, color:"#94a3b8", marginTop:4 }}>{label}</div>
            <div style={{ fontSize:11, color:`${color}cc`, marginTop:6, fontWeight:500 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div className="glass" style={{ borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>District-wise Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DISTRICT_DATA}>
              <XAxis dataKey="district" tick={{ fontSize:9 }} interval={0} angle={-25} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize:10 }} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="low" name="Low" fill="#14b8a6" stackId="a" radius={[0,0,0,0]} />
              <Bar dataKey="medium" name="Medium" fill="#f59e0b" stackId="a" />
              <Bar dataKey="high" name="High" fill="#ef4444" stackId="a" radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass" style={{ borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>Risk Composition</h3>
          <div style={{ display:"flex", alignItems:"center", gap:24 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={RISK_PIE} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" stroke="none">
                  {RISK_PIE.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background:"#1e293b", border:"none", borderRadius:8, fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {RISK_PIE.map(({ name, value, color }) => (
                <div key={name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:12, height:12, borderRadius:"50%", background:color, flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:12, color:"white", fontWeight:500 }}>{name}</div>
                    <div style={{ fontSize:11, color, fontFamily:"monospace" }}>{value}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div className="glass" style={{ borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>Malnutrition Indicators</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {INDICATORS.map(({ name, value, color }) => (
              <div key={name}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span style={{ color:"#94a3b8" }}>{name}</span>
                  <span style={{ color, fontFamily:"monospace", fontWeight:600 }}>{value}%</span>
                </div>
                <div style={{ height:6, borderRadius:3, background:"rgba(71,85,105,0.5)" }}>
                  <div style={{ height:6, borderRadius:3, width:`${(value/16)*100}%`, background:color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>6-Month Forecast</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={FORECAST}>
              <XAxis dataKey="month" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip content={<TT />} />
              <Line type="monotone" dataKey="high" name="High Risk" stroke="#ef4444" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="medium" name="Medium Risk" stroke="#f59e0b" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8 }}>
            <TrendingDown size={14} color="#34d399" />
            <span style={{ fontSize:11, color:"#34d399" }}>High risk projected to decrease 70% in 6 months</span>
          </div>
        </div>
      </div>
    </div>
  );
}
