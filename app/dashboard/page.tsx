"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Users, CheckCircle2, Zap, Target, TrendingDown } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { createClient } from "@/lib/supabase";

const FORECAST = [
  { month:"Jul", high:46, medium:667 },{ month:"Aug", high:44, medium:660 },
  { month:"Sep", high:42, medium:653 },{ month:"Oct", high:40, medium:647 },
  { month:"Nov", high:39, medium:640 },{ month:"Dec", high:38, medium:634 },
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
  const [stats, setStats] = useState({ total:0, high:0, medium:0, low:0, coverage:0 });
  const [distData, setDistData] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // Fetch all stats in parallel
      const [totalRes, highRes, medRes, lowRes, enrolledRes, distRes, defRes] = await Promise.all([
        supabase.from("child_records").select("*", { count:"exact", head:true }),
        supabase.from("child_records").select("*", { count:"exact", head:true }).eq("risk_label","High"),
        supabase.from("child_records").select("*", { count:"exact", head:true }).eq("risk_label","Medium"),
        supabase.from("child_records").select("*", { count:"exact", head:true }).eq("risk_label","Low"),
        supabase.from("child_records").select("*", { count:"exact", head:true }).eq("poshan_abhiyaan", true),
        supabase.from("child_records").select("district,risk_label"),
        supabase.from("child_records").select("iron_deficiency,vitamin_a_deficiency,protein_deficiency,zinc_deficiency,stunting,wasting,underweight"),
      ]);

      const total = totalRes.count ?? 0;
      const high  = highRes.count ?? 0;
      const medium= medRes.count ?? 0;
      const low   = lowRes.count ?? 0;
      const enrolled = enrolledRes.count ?? 0;
      setStats({ total, high, medium, low, coverage: total ? Math.round((enrolled/total)*1000)/10 : 0 });

      // District chart data
      const dmap: Record<string,{low:number;medium:number;high:number}> = {};
      for (const r of distRes.data ?? []) {
        if (!dmap[r.district]) dmap[r.district] = { low:0, medium:0, high:0 };
        if (r.risk_label==="High") dmap[r.district].high++;
        else if (r.risk_label==="Medium") dmap[r.district].medium++;
        else dmap[r.district].low++;
      }
      setDistData(Object.entries(dmap).map(([district, v]) => ({ district: district.substring(0,8), ...v })));

      // Deficiency indicators
      const def = defRes.data ?? [];
      const n = def.length || 1;
      const count = (key: string) => def.filter((r:any) => r[key]===true||r[key]==="true"||r[key]===1||r[key]==="1"||r[key]==="Yes").length;
      setIndicators([
        { name:"Iron Deficiency",     value: +(count("iron_deficiency")/n*100).toFixed(1),     color:"#8b5cf6" },
        { name:"Vitamin A Deficiency",value: +(count("vitamin_a_deficiency")/n*100).toFixed(1), color:"#ec4899" },
        { name:"Protein Deficiency",  value: +(count("protein_deficiency")/n*100).toFixed(1),   color:"#f59e0b" },
        { name:"Zinc Deficiency",     value: +(count("zinc_deficiency")/n*100).toFixed(1),      color:"#60a5fa" },
        { name:"Stunting",            value: +(count("stunting")/n*100).toFixed(1),              color:"#ef4444" },
        { name:"Wasting",             value: +(count("wasting")/n*100).toFixed(1),               color:"#f97316" },
        { name:"Underweight",         value: +(count("underweight")/n*100).toFixed(1),           color:"#3b82f6" },
      ]);
      setLoading(false);
    }
    load();
  }, []);

  const CARDS = [
    { label:"Total Children", value: loading ? "..." : stats.total.toLocaleString(), sub:"Live from Supabase", icon:Users, color:"#60a5fa" },
    { label:"Healthy (Low Risk)", value: loading ? "..." : stats.low.toLocaleString(), sub: loading ? "" : `${+(stats.low/Math.max(stats.total,1)*100).toFixed(1)}% of total`, icon:CheckCircle2, color:"#34d399" },
    { label:"Medium Risk", value: loading ? "..." : stats.medium.toLocaleString(), sub:"Needs monitoring", icon:Zap, color:"#fbbf24" },
    { label:"High Risk", value: loading ? "..." : stats.high.toLocaleString(), sub:"Immediate action", icon:AlertTriangle, color:"#f87171" },
    { label:"POSHAN Coverage", value: loading ? "..." : `${stats.coverage}%`, sub:"Abhiyaan enrolled", icon:Target, color:"#c084fc" },
  ];

  const riskPie = [
    { name:"Low",    value: stats.total ? +(stats.low/stats.total*100).toFixed(1) : 0,    color:"#14b8a6" },
    { name:"Medium", value: stats.total ? +(stats.medium/stats.total*100).toFixed(1) : 0, color:"#f59e0b" },
    { name:"High",   value: stats.total ? +(stats.high/stats.total*100).toFixed(1) : 0,   color:"#ef4444" },
  ];

  const maxInd = Math.max(...indicators.map(i => i.value), 1);

  return (
    <div style={{ padding:24 }}>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:24, fontWeight:700, color:"white" }}>Executive Overview</h1>
        <p style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>Real-time child nutrition analytics across Karnataka</p>
      </div>

      {!loading && stats.high > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", borderRadius:12, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", marginBottom:24 }}>
          <AlertTriangle size={16} color="#ef4444" style={{ flexShrink:0 }} />
          <p style={{ fontSize:13, color:"#cbd5e1" }}>
            <strong style={{ color:"#f87171" }}>{stats.high} children</strong> classified as High Risk require immediate intervention across Karnataka.
          </p>
        </div>
      )}

      {/* Stat cards */}
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

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div className="glass" style={{ borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>District-wise Risk Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distData}>
              <XAxis dataKey="district" tick={{ fontSize:9 }} interval={0} angle={-25} textAnchor="end" height={45} />
              <YAxis tick={{ fontSize:10 }} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="low" name="Low" fill="#14b8a6" stackId="a" />
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
                <Pie data={riskPie} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" stroke="none">
                  {riskPie.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v:number) => `${v}%`} contentStyle={{ background:"#1e293b", border:"none", borderRadius:8, fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
              {riskPie.map(({ name, value, color }) => (
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
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>Malnutrition Indicators — Real Data</h3>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
            {indicators.map(({ name, value, color }) => (
              <div key={name}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span style={{ color:"#94a3b8" }}>{name}</span>
                  <span style={{ color, fontFamily:"monospace", fontWeight:600 }}>{value}%</span>
                </div>
                <div style={{ height:6, borderRadius:3, background:"rgba(71,85,105,0.5)" }}>
                  <div style={{ height:6, borderRadius:3, width:`${(value/maxInd)*100}%`, background:color, transition:"width 1s" }} />
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
            <span style={{ fontSize:11, color:"#34d399" }}>High risk projected to decrease over 6 months</span>
          </div>
        </div>
      </div>
    </div>
  );
}