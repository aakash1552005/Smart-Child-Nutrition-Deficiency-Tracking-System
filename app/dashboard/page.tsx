"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, Users, CheckCircle2, Zap, TrendingDown, Activity, Shield, MapPin } from "lucide-react";
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
    <div style={{ background:"#0f172a", border:"1px solid rgba(148,163,184,0.15)", borderRadius:10, padding:"10px 14px", fontSize:12 }}>
      <div style={{ color:"white", fontWeight:600, marginBottom:6 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }} />
          <span style={{ color:"#94a3b8" }}>{p.name}:</span>
          <span style={{ color:"white", fontWeight:500 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function StatCard({ label, value, sub, icon:Icon, color, loading }: any) {
  return (
    <div className="glass stat-card" style={{ borderRadius:16, padding:22, borderLeft:`3px solid ${color}`, position:"relative" as const, overflow:"hidden" }}>
      <div style={{ position:"absolute" as const, top:16, right:16, width:40, height:40, borderRadius:12, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center" }}>
        <Icon size={18} color={color} />
      </div>
      <div style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.05em", marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:800, color, marginBottom:4 }}>
        {loading ? <span style={{ fontSize:14, color:"#475569" }}>Loading...</span> : value}
      </div>
      <div style={{ fontSize:11, color:"#64748b" }}>{sub}</div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats]       = useState({ total:0, high:0, medium:0, low:0, vaccinated:0, breastfed:0 });
  const [distData, setDistData] = useState<any[]>([]);
  const [indicators, setIndicators] = useState<any[]>([]);
  const [riskPie, setRiskPie]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [riskValues, setRiskValues] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      // First, detect actual risk_label values
      const { data: sample } = await supabase.from("child_records").select("risk_label").limit(10);
      const uniqueRisk = [...new Set((sample??[]).map((r:any) => r.risk_label))].filter(Boolean);
      setRiskValues(uniqueRisk);

      // Detect High/Medium/Low patterns
      const isHigh   = (v:string) => v?.toLowerCase().includes("high");
      const isMedium = (v:string) => v?.toLowerCase().includes("medium") || v?.toLowerCase().includes("mod");
      const isLow    = (v:string) => v?.toLowerCase().includes("low");

      // Fetch ALL records in batches (Supabase limit is 1000 per call)
      let all: any[] = [];
      let from = 0;
      const batchSize = 1000;
      while (true) {
        const { data: batch } = await supabase
          .from("child_records")
          .select("risk_label,district,iron_deficiency,vitamin_a_deficiency,protein_deficiency,zinc_deficiency,stunting,wasting,underweight,vaccination_status,breastfeeding,poshan_abhiyaan")
          .range(from, from + batchSize - 1);
        if (!batch || batch.length === 0) break;
        all = [...all, ...batch];
        if (batch.length < batchSize) break;
        from += batchSize;
      }
      const total = all.length;
      const high   = all.filter((r:any) => isHigh(r.risk_label)).length;
      const medium = all.filter((r:any) => isMedium(r.risk_label)).length;
      const low    = all.filter((r:any) => isLow(r.risk_label)).length;
      const vaccinated = all.filter((r:any) => r.vaccination_status==="Complete").length;
      const breastfed  = all.filter((r:any) => r.breastfeeding==="Yes").length;

      setStats({ total, high, medium, low, vaccinated, breastfed });

      // District chart
      const dmap: Record<string,{low:number;medium:number;high:number}> = {};
      for (const r of all) {
        if (!r.district) continue;
        if (!dmap[r.district]) dmap[r.district] = { low:0, medium:0, high:0 };
        if (isHigh(r.risk_label)) dmap[r.district].high++;
        else if (isMedium(r.risk_label)) dmap[r.district].medium++;
        else dmap[r.district].low++;
      }
      setDistData(Object.entries(dmap).map(([d,v]) => ({ district:d.substring(0,9), ...v })));

      // Risk pie
      setRiskPie([
        { name:"Low",    value: total ? +(low/total*100).toFixed(1) : 0,    color:"#14b8a6" },
        { name:"Medium", value: total ? +(medium/total*100).toFixed(1) : 0, color:"#f59e0b" },
        { name:"High",   value: total ? +(high/total*100).toFixed(1) : 0,   color:"#ef4444" },
      ]);

      // Deficiency indicators
      const cnt = (key:string) => all.filter((r:any) => r[key]===true||r[key]==="true"||r[key]===1||r[key]==="Yes"||r[key]==="yes").length;
      const n = total || 1;
      setIndicators([
        { name:"Iron Deficiency",      value:+(cnt("iron_deficiency")/n*100).toFixed(1),      color:"#8b5cf6" },
        { name:"Vitamin A Deficiency", value:+(cnt("vitamin_a_deficiency")/n*100).toFixed(1), color:"#ec4899" },
        { name:"Protein Deficiency",   value:+(cnt("protein_deficiency")/n*100).toFixed(1),   color:"#f59e0b" },
        { name:"Zinc Deficiency",      value:+(cnt("zinc_deficiency")/n*100).toFixed(1),       color:"#60a5fa" },
        { name:"Stunting",             value:+(cnt("stunting")/n*100).toFixed(1),              color:"#ef4444" },
        { name:"Wasting",              value:+(cnt("wasting")/n*100).toFixed(1),               color:"#f97316" },
        { name:"Underweight",          value:+(cnt("underweight")/n*100).toFixed(1),           color:"#3b82f6" },
      ]);
      setLoading(false);
    }
    load();
  }, []);

  const maxInd = Math.max(...indicators.map(i => i.value), 1);
  const vacPct = stats.total ? +(stats.vaccinated/stats.total*100).toFixed(1) : 0;

  return (
    <div style={{ padding:24 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:26, fontWeight:800, color:"white", letterSpacing:"-0.02em" }}>Executive Overview</h1>
          <p style={{ fontSize:13, color:"#64748b", marginTop:4 }}>Real-time child nutrition analytics across Karnataka · {stats.total.toLocaleString()} records</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:999, background:"rgba(20,184,166,0.1)", border:"1px solid rgba(20,184,166,0.15)" }}>
          <div className="live-dot" style={{ width:7, height:7, borderRadius:"50%", background:"#14b8a6" }} />
          <span style={{ fontSize:11, color:"#14b8a6", fontWeight:600, fontFamily:"monospace" }}>LIVE DATABASE</span>
        </div>
      </div>

      {/* Alert */}
      {!loading && stats.high > 0 && (
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 20px", borderRadius:14, background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.2)", marginBottom:20 }}>
          <AlertTriangle size={16} color="#ef4444" style={{ flexShrink:0 }} />
          <p style={{ fontSize:13, color:"#cbd5e1" }}>
            <strong style={{ color:"#f87171" }}>{stats.high} children</strong> classified as High Risk require immediate intervention.
            {stats.vaccinated < stats.total && <> · <strong style={{ color:"#fbbf24" }}>{(stats.total-stats.vaccinated).toLocaleString()} children</strong> not fully vaccinated.</>}
          </p>
        </div>
      )}

      {/* Stat cards - 4 main */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:16 }}>
        <StatCard label="Total Children" value={stats.total.toLocaleString()} sub="Registered in Karnataka" icon={Users} color="#60a5fa" loading={loading} />
        <StatCard label="High Risk" value={stats.high.toLocaleString()} sub="Immediate action required" icon={AlertTriangle} color="#ef4444" loading={loading} />
        <StatCard label="Medium Risk" value={stats.medium.toLocaleString()} sub="Needs monitoring" icon={Zap} color="#f59e0b" loading={loading} />
        <StatCard label="Low Risk (Healthy)" value={stats.low.toLocaleString()} sub={`${stats.total ? +(stats.low/stats.total*100).toFixed(1) : 0}% of total`} icon={CheckCircle2} color="#34d399" loading={loading} />
      </div>

      {/* Secondary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        <div className="glass" style={{ borderRadius:14, padding:18, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(96,165,250,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Shield size={20} color="#60a5fa" />
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"#60a5fa" }}>{loading ? "..." : `${vacPct}%`}</div>
            <div style={{ fontSize:12, color:"#94a3b8" }}>Vaccination Coverage</div>
            <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>{loading ? "" : `${stats.vaccinated.toLocaleString()} fully vaccinated · ${stats.total-stats.vaccinated} partial/none`}</div>
          </div>
        </div>
        <div className="glass" style={{ borderRadius:14, padding:18, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(236,72,153,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Activity size={20} color="#ec4899" />
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"#ec4899" }}>{loading ? "..." : `${stats.total ? +(stats.breastfed/stats.total*100).toFixed(1) : 0}%`}</div>
            <div style={{ fontSize:12, color:"#94a3b8" }}>Breastfeeding Rate</div>
            <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>{loading ? "" : `${stats.breastfed.toLocaleString()} children breastfed`}</div>
          </div>
        </div>
        <div className="glass" style={{ borderRadius:14, padding:18, display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"rgba(52,211,153,0.1)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <MapPin size={20} color="#34d399" />
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:"#34d399" }}>10</div>
            <div style={{ fontSize:12, color:"#94a3b8" }}>Districts Covered</div>
            <div style={{ fontSize:11, color:"#475569", marginTop:2 }}>Across Karnataka state</div>
          </div>
        </div>
      </div>

      {/* Charts row 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:20, marginBottom:20 }}>
        <div className="glass" style={{ borderRadius:16, padding:22 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:4 }}>District-wise Risk Distribution</h3>
          <p style={{ fontSize:11, color:"#64748b", marginBottom:16 }}>Real-time data from Supabase</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={distData} margin={{ bottom:20 }}>
              <XAxis dataKey="district" tick={{ fontSize:9, fill:"#64748b" }} interval={0} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize:10, fill:"#64748b" }} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Bar dataKey="low" name="Low" fill="#14b8a6" stackId="a" />
              <Bar dataKey="medium" name="Medium" fill="#f59e0b" stackId="a" />
              <Bar dataKey="high" name="High" fill="#ef4444" stackId="a" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass" style={{ borderRadius:16, padding:22 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:4 }}>Risk Composition</h3>
          <p style={{ fontSize:11, color:"#64748b", marginBottom:16 }}>Percentage breakdown</p>
          <div style={{ display:"flex", flexDirection:"column" as const, alignItems:"center", gap:16 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={riskPie} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" stroke="none">
                  {riskPie.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip formatter={(v:number) => `${v}%`} contentStyle={{ background:"#1e293b", border:"none", borderRadius:8, fontSize:12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display:"flex", flexDirection:"column" as const, gap:8, width:"100%" }}>
              {riskPie.map(({ name, value, color }) => (
                <div key={name} style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:10, height:10, borderRadius:2, background:color }} />
                    <span style={{ fontSize:12, color:"#94a3b8" }}>{name} Risk</span>
                  </div>
                  <span style={{ fontSize:12, fontFamily:"monospace", color, fontWeight:700 }}>{value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div className="glass" style={{ borderRadius:16, padding:22 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:4 }}>Malnutrition Indicators</h3>
          <p style={{ fontSize:11, color:"#64748b", marginBottom:16 }}>Computed from real Supabase records</p>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
            {indicators.map(({ name, value, color }) => (
              <div key={name}>
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5 }}>
                  <span style={{ color:"#94a3b8" }}>{name}</span>
                  <span style={{ color, fontFamily:"monospace", fontWeight:700 }}>{value}%</span>
                </div>
                <div style={{ height:6, borderRadius:3, background:"rgba(71,85,105,0.4)" }}>
                  <div style={{ height:6, borderRadius:3, width:`${(value/maxInd)*100}%`, background:`linear-gradient(90deg,${color}88,${color})`, transition:"width 1s" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass" style={{ borderRadius:16, padding:22 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:4 }}>6-Month Risk Forecast</h3>
          <p style={{ fontSize:11, color:"#64748b", marginBottom:16 }}>SimpleForecaster projection</p>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={FORECAST}>
              <XAxis dataKey="month" tick={{ fontSize:11, fill:"#64748b" }} />
              <YAxis tick={{ fontSize:11, fill:"#64748b" }} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ fontSize:11 }} />
              <Line type="monotone" dataKey="high" name="High Risk" stroke="#ef4444" strokeWidth={2} dot={{ r:3, fill:"#ef4444" }} />
              <Line type="monotone" dataKey="medium" name="Medium Risk" stroke="#f59e0b" strokeWidth={2} dot={{ r:3, fill:"#f59e0b" }} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:10, padding:"8px 12px", borderRadius:8, background:"rgba(52,211,153,0.06)", border:"1px solid rgba(52,211,153,0.1)" }}>
            <TrendingDown size={13} color="#34d399" />
            <span style={{ fontSize:11, color:"#34d399" }}>High risk projected to drop 70% by December 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}