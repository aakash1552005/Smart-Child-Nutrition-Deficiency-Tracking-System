"use client";
import { useState, useEffect } from "react";
import { Gift, TrendingUp, Users, AlertCircle, Search, ChevronDown, UserX, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { DISTRICTS } from "@/lib/mock-data";

const SCHEMES = [
  { key:"poshan_abhiyaan", name:"POSHAN Abhiyaan",       color:"#f59e0b", desc:"Supplementary nutrition and growth monitoring" },
  { key:"icds_enrolled",   name:"ICDS Programme",         color:"#14b8a6", desc:"Integrated Child Development Services" },
  { key:"mid_day_meal",    name:"Mid-Day Meal",           color:"#60a5fa", desc:"School nutrition programme" },
];

const RISK_COLOR = (r:string) =>
  r==="High Risk"||r==="High" ? { color:"#ef4444", bg:"rgba(239,68,68,0.1)" }
  : r==="Medium Risk"||r==="Medium" ? { color:"#f59e0b", bg:"rgba(245,158,11,0.1)" }
  : { color:"#14b8a6", bg:"rgba(20,184,166,0.1)" };

export default function SchemesPage() {
  const [allRecords, setAllRecords]   = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [activeScheme, setActiveScheme] = useState<string|null>(null);
  const [distFilter, setDistFilter]   = useState("All");
  const [riskFilter, setRiskFilter]   = useState("All");
  const [search, setSearch]           = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      let all: any[] = [];
      let from = 0;
      while (true) {
        const { data } = await supabase.from("child_records")
          .select("child_id,age_months,gender,district,risk_label,poshan_abhiyaan,icds_enrolled,mid_day_meal,vaccination_status,breastfeeding")
          .range(from, from + 999);
        if (!data || data.length === 0) break;
        all = [...all, ...data];
        if (data.length < 1000) break;
        from += 1000;
      }
      setAllRecords(all);
      setLoading(false);
    }
    load();
  }, []);

  const total = allRecords.length;

  // Per-scheme stats
  const schemeStats = SCHEMES.map(s => {
    const enrolled   = allRecords.filter(r => r[s.key]==="Yes"||r[s.key]===true||r[s.key]===1).length;
    const unenrolled = total - enrolled;
    const pct        = total ? Math.round(enrolled/total*100) : 0;
    return { ...s, enrolled, unenrolled, eligible: total, pct,
      badge: pct>=70 ? { text:"Good", color:"#34d399", bg:"rgba(52,211,153,0.1)" }
           : pct>=50 ? { text:"Moderate", color:"#f59e0b", bg:"rgba(245,158,11,0.1)" }
           : { text:"Needs attention", color:"#f87171", bg:"rgba(248,113,113,0.1)" }
    };
  });

  const totalEnrolled   = Math.max(...schemeStats.map(s=>s.enrolled));
  const totalUnenrolled = allRecords.filter(r =>
    !["Yes",true,1].includes(r.poshan_abhiyaan) &&
    !["Yes",true,1].includes(r.icds_enrolled) &&
    !["Yes",true,1].includes(r.mid_day_meal)
  ).length;
  const avgCoverage = total ? Math.round(schemeStats.reduce((s,x)=>s+x.pct,0)/schemeStats.length) : 0;

  // Unenrolled list for active scheme
  const scheme = schemeStats.find(s => s.key === activeScheme);
  const unenrolledList = activeScheme
    ? allRecords.filter(r => !["Yes",true,1].includes(r[activeScheme]))
    : [];

  const filtered = unenrolledList.filter(c => {
    if (distFilter!=="All" && c.district!==distFilter) return false;
    if (riskFilter!=="All" && !c.risk_label?.toLowerCase().includes(riskFilter.toLowerCase())) return false;
    if (search && !c.child_id?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const S = { padding:"7px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"#cbd5e1", fontSize:12, outline:"none" } as const;

  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>Welfare Schemes</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>Scheme enrollment and coverage tracking across Karnataka · Live from Supabase</p>

      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Active Schemes",      value: SCHEMES.length,              icon:Gift,        color:"#14b8a6" },
          { label:"Total Children",       value: loading?"...":total.toLocaleString(), icon:Users, color:"#60a5fa" },
          { label:"Avg Coverage",         value: loading?"...":`${avgCoverage}%`,  icon:TrendingUp, color:"#34d399" },
          { label:"Unenrolled (All)",     value: loading?"...":totalUnenrolled.toLocaleString(), icon:UserX, color:"#f87171" },
        ].map(({ label, value, icon:Icon, color }) => (
          <div key={label} className="glass stat-card" style={{ borderRadius:16, padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:38, height:38, borderRadius:10, background:`${color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
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

      {/* Scheme cards */}
      <div style={{ display:"flex", flexDirection:"column" as const, gap:16, marginBottom:24 }}>
        {schemeStats.map(s => {
          const isOpen = activeScheme === s.key;
          return (
            <div key={s.key} className="glass" style={{ borderRadius:16, overflow:"hidden" }}>
              <div style={{ padding:24 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:16 }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <CheckCircle2 size={16} color={s.color} />
                      <h3 style={{ fontSize:15, fontWeight:600, color:"white" }}>{s.name}</h3>
                      <span style={{ fontSize:11, color:"#64748b" }}>— {s.desc}</span>
                    </div>
                    <div style={{ fontSize:12, color:"#94a3b8", marginBottom:12 }}>
                      {loading ? "Loading..." : `${s.enrolled.toLocaleString()} enrolled of ${s.eligible.toLocaleString()} eligible`}
                    </div>
                    <div style={{ height:8, borderRadius:4, background:"rgba(71,85,105,0.4)", maxWidth:500 }}>
                      <div style={{ height:8, borderRadius:4, width:`${s.pct}%`, background:`linear-gradient(90deg,${s.color}88,${s.color})`, transition:"width 0.8s" }} />
                    </div>
                  </div>
                  <div style={{ textAlign:"right" as const, flexShrink:0 }}>
                    <div style={{ fontSize:34, fontWeight:800, color:s.color }}>{s.pct}%</div>
                    <div style={{ fontSize:11, color:"#64748b" }}>coverage</div>
                    <span style={{ fontSize:11, padding:"3px 10px", borderRadius:999, fontWeight:500, color:s.badge.color, background:s.badge.bg }}>{s.badge.text}</span>
                  </div>
                </div>

                <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid rgba(148,163,184,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <AlertCircle size={14} color="#f87171" />
                    <span style={{ fontSize:13, color:"#f87171", fontWeight:500 }}>{loading?"...":s.unenrolled.toLocaleString()} children not enrolled</span>
                    <span style={{ fontSize:11, color:"#64748b" }}>— need outreach</span>
                  </div>
                  <button onClick={() => setActiveScheme(isOpen ? null : s.key)}
                    style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:500, color:"#14b8a6", background:"rgba(20,184,166,0.08)", border:"1px solid rgba(20,184,166,0.2)", borderRadius:8, padding:"6px 14px", cursor:"pointer" }}>
                    {isOpen ? "Hide list" : "View unenrolled list"}
                    <ChevronDown size={14} style={{ transform:isOpen?"rotate(180deg)":"none", transition:"transform 0.2s" }} />
                  </button>
                </div>
              </div>

              {/* Unenrolled children panel */}
              {isOpen && (
                <div style={{ borderTop:"1px solid rgba(148,163,184,0.08)", background:"rgba(15,23,42,0.5)" }}>
                  <div style={{ padding:"14px 24px", display:"flex", gap:10, flexWrap:"wrap" as const, borderBottom:"1px solid rgba(148,163,184,0.06)", alignItems:"center" }}>
                    <div style={{ position:"relative" as const, flex:1, minWidth:180 }}>
                      <Search size={13} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)", color:"#64748b" }} />
                      <input placeholder="Search by Child ID..." value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{ ...S, width:"100%", paddingLeft:28 }} />
                    </div>
                    <select value={distFilter} onChange={e => setDistFilter(e.target.value)} style={S}>
                      <option>All</option>
                      {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={S}>
                      <option>All</option>
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                    <span style={{ fontSize:12, color:"#64748b" }}>{filtered.length.toLocaleString()} shown</span>
                  </div>
                  <div style={{ overflowX:"auto" as const, maxHeight:"400px", overflowY:"auto" as const }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" as const, fontSize:13 }}>
                      <thead style={{ position:"sticky" as const, top:0, background:"rgba(15,23,42,0.98)" }}>
                        <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.08)" }}>
                          {["Child ID","Age","Gender","District","Risk Level","Vaccination","Breastfed"].map(h => (
                            <th key={h} style={{ padding:"10px 16px", textAlign:"left" as const, fontSize:10, fontWeight:600, color:"#475569", textTransform:"uppercase" as const, letterSpacing:"0.04em", whiteSpace:"nowrap" as const }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.slice(0,50).map(c => {
                          const rc = RISK_COLOR(c.risk_label);
                          return (
                            <tr key={c.child_id} className="table-row-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                              <td style={{ padding:"9px 16px", fontFamily:"monospace", fontSize:11, color:"#64748b" }}>{c.child_id}</td>
                              <td style={{ padding:"9px 16px", color:"#94a3b8" }}>{c.age_months}m</td>
                              <td style={{ padding:"9px 16px", color:"#94a3b8" }}>{c.gender}</td>
                              <td style={{ padding:"9px 16px", color:"#94a3b8" }}>{c.district}</td>
                              <td style={{ padding:"9px 16px" }}>
                                <span style={{ fontSize:11, padding:"2px 8px", borderRadius:999, fontWeight:500, color:rc.color, background:rc.bg }}>{c.risk_label}</span>
                              </td>
                              <td style={{ padding:"9px 16px", fontSize:12, color: c.vaccination_status==="Complete"?"#34d399":"#f87171" }}>{c.vaccination_status}</td>
                              <td style={{ padding:"9px 16px", fontSize:12, color: c.breastfeeding==="Yes"?"#34d399":"#f87171" }}>{c.breastfeeding}</td>
                            </tr>
                          );
                        })}
                        {filtered.length === 0 && (
                          <tr><td colSpan={7} style={{ padding:32, textAlign:"center" as const, color:"#475569" }}>No children match the filters.</td></tr>
                        )}
                      </tbody>
                    </table>
                    {filtered.length > 50 && (
                      <div style={{ padding:"10px 24px", fontSize:12, color:"#475569", borderTop:"1px solid rgba(148,163,184,0.06)" }}>
                        Showing 50 of {filtered.length.toLocaleString()} — use filters to narrow down
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alert */}
      <div className="glass" style={{ borderRadius:16, padding:20, display:"flex", alignItems:"flex-start", gap:12, border:"1px solid rgba(248,113,113,0.2)", background:"rgba(248,113,113,0.04)" }}>
        <AlertCircle size={16} color="#f87171" style={{ flexShrink:0, marginTop:2 }} />
        <p style={{ fontSize:13, color:"#cbd5e1" }}>
          <strong style={{ color:"#f87171" }}>{loading?"...":totalUnenrolled.toLocaleString()} eligible children</strong> remain unenrolled in all 3 welfare schemes.
          Door-to-door outreach and Anganwadi registration drives recommended across all 10 districts.
        </p>
      </div>
    </div>
  );
}