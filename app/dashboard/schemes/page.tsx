"use client";
import { useState } from "react";
import { Gift, TrendingUp, Users, CheckCircle2, AlertCircle, Search, ChevronDown, UserX } from "lucide-react";
import { WELFARE, DISTRICTS } from "@/lib/mock-data";

// Generate unenrolled children per scheme
function genUnenrolled(schemeName: string, count: number) {
  const firstNames = ["Aarav","Priya","Kiran","Deepa","Rahul","Ananya","Vikram","Suma","Arjun","Nandini","Ravi","Kavya","Suresh","Meena","Ajay","Lakshmi","Mohan","Geetha","Sanjay","Rekha"];
  const reasons = ["Not registered at Anganwadi","Guardian unaware of scheme","Documentation pending","Migrant family","Recently relocated","Income proof missing","Age criterion mismatch"];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    child_id: "KA" + String(10000 + i).padStart(5,"0"),
    name: firstNames[i % firstNames.length] + " " + String.fromCharCode(65 + (i * 3) % 26) + ".",
    age_months: 6 + ((i * 7) % 54),
    gender: i % 2 === 0 ? "M" : "F",
    district: DISTRICTS[i % DISTRICTS.length],
    risk: i % 10 < 2 ? "High" : i % 10 < 5 ? "Medium" : "Low",
    reason: reasons[i % reasons.length],
    scheme: schemeName,
  }));
}

const SCHEME_DETAILS = WELFARE.map((s) => ({
  ...s,
  unenrolled: s.eligible - s.enrolled,
  unenrolledList: genUnenrolled(s.name, Math.min(s.eligible - s.enrolled, 40)),
}));

const riskColor = (r: string) =>
  r === "High" ? { color:"#ef4444", bg:"rgba(239,68,68,0.1)" }
  : r === "Medium" ? { color:"#f59e0b", bg:"rgba(245,158,11,0.1)" }
  : { color:"#14b8a6", bg:"rgba(20,184,166,0.1)" };

export default function SchemesPage() {
  const [activeScheme, setActiveScheme] = useState<string | null>(null);
  const [distFilter, setDistFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [search, setSearch] = useState("");

  const scheme = SCHEME_DETAILS.find((s) => s.name === activeScheme);

  const filtered = scheme?.unenrolledList.filter((c) => {
    if (distFilter !== "All" && c.district !== distFilter) return false;
    if (riskFilter !== "All" && c.risk !== riskFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.child_id.includes(search)) return false;
    return true;
  }) ?? [];

  const totalUnenrolled = SCHEME_DETAILS.reduce((s, d) => s + d.unenrolled, 0);

  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>Welfare Schemes</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>Scheme enrollment and coverage tracking across Karnataka</p>

      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Active Schemes", value:"5", icon:Gift, color:"#14b8a6" },
          { label:"Total Enrollments", value:"13,280", icon:Users, color:"#60a5fa" },
          { label:"Avg Coverage", value:"63.6%", icon:TrendingUp, color:"#34d399" },
          { label:"Unenrolled Children", value:totalUnenrolled.toLocaleString(), icon:UserX, color:"#f87171" },
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

      {/* Scheme cards */}
      <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:24 }}>
        {SCHEME_DETAILS.map((s) => {
          const barColor = s.pct >= 70 ? "#34d399" : s.pct >= 55 ? "#f59e0b" : "#f87171";
          const badge = s.pct >= 70 ? { text:"Good", color:"#34d399", bg:"rgba(52,211,153,0.1)" }
            : s.pct >= 55 ? { text:"Moderate", color:"#f59e0b", bg:"rgba(245,158,11,0.1)" }
            : { text:"Needs attention", color:"#f87171", bg:"rgba(248,113,113,0.1)" };
          const isOpen = activeScheme === s.name;
          return (
            <div key={s.name} className="glass" style={{ borderRadius:16, overflow:"hidden" }}>
              <div style={{ padding:24 }}>
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
                  <div style={{ textAlign:"right" as const, flexShrink:0 }}>
                    <div style={{ fontSize:32, fontWeight:700, color:barColor }}>{s.pct}%</div>
                    <div style={{ fontSize:11, color:"#64748b" }}>coverage</div>
                    <div style={{ marginTop:6, display:"inline-block", padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:500, color:badge.color, background:badge.bg }}>{badge.text}</div>
                  </div>
                </div>

                {/* Unenrolled trigger */}
                <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid rgba(148,163,184,0.07)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <AlertCircle size={14} color="#f87171" />
                    <span style={{ fontSize:13, color:"#f87171", fontWeight:500 }}>
                      {s.unenrolled.toLocaleString()} children not enrolled
                    </span>
                    <span style={{ fontSize:11, color:"#64748b" }}>— need outreach</span>
                  </div>
                  <button
                    onClick={() => setActiveScheme(isOpen ? null : s.name)}
                    style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, fontWeight:500, color:"#14b8a6", background:"rgba(20,184,166,0.08)", border:"1px solid rgba(20,184,166,0.2)", borderRadius:8, padding:"6px 14px", cursor:"pointer" }}>
                    {isOpen ? "Hide list" : "View unenrolled list"}
                    <ChevronDown size={14} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition:"transform 0.2s" }} />
                  </button>
                </div>
              </div>

              {/* Unenrolled children panel */}
              {isOpen && (
                <div style={{ borderTop:"1px solid rgba(148,163,184,0.08)", background:"rgba(15,23,42,0.5)" }}>
                  {/* Filters */}
                  <div style={{ padding:"16px 24px", display:"flex", gap:12, flexWrap:"wrap" as const, borderBottom:"1px solid rgba(148,163,184,0.06)" }}>
                    <div style={{ position:"relative" as const, flex:1, minWidth:180 }}>
                      <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }} />
                      <input
                        placeholder="Search by name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width:"100%", paddingLeft:32, paddingRight:12, paddingTop:8, paddingBottom:8, background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"white", fontSize:13, outline:"none" }}
                      />
                    </div>
                    <select
                      value={distFilter}
                      onChange={(e) => setDistFilter(e.target.value)}
                      style={{ padding:"8px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"#cbd5e1", fontSize:13, outline:"none", cursor:"pointer" }}>
                      <option value="All">All Districts</option>
                      {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                    </select>
                    <select
                      value={riskFilter}
                      onChange={(e) => setRiskFilter(e.target.value)}
                      style={{ padding:"8px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"#cbd5e1", fontSize:13, outline:"none", cursor:"pointer" }}>
                      <option value="All">All Risk Levels</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                    <span style={{ fontSize:12, color:"#64748b", alignSelf:"center" }}>{filtered.length} children shown</span>
                  </div>

                  {/* Table */}
                  <div style={{ overflowX:"auto" as const }}>
                    <table style={{ width:"100%", borderCollapse:"collapse" as const, fontSize:13 }}>
                      <thead>
                        <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.08)" }}>
                          {["Child ID","Name","Age","Gender","District","Risk Level","Reason for Non-Enrollment"].map((h) => (
                            <th key={h} style={{ padding:"10px 16px", textAlign:"left" as const, fontSize:11, fontWeight:600, color:"#475569", textTransform:"uppercase" as const, letterSpacing:"0.04em", whiteSpace:"nowrap" as const }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.slice(0, 30).map((c) => {
                          const rc = riskColor(c.risk);
                          return (
                            <tr key={c.id} className="table-row-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                              <td style={{ padding:"10px 16px", fontFamily:"monospace", fontSize:12, color:"#64748b" }}>{c.child_id}</td>
                              <td style={{ padding:"10px 16px", color:"white", fontWeight:500 }}>{c.name}</td>
                              <td style={{ padding:"10px 16px", color:"#94a3b8" }}>{c.age_months}m</td>
                              <td style={{ padding:"10px 16px", color:"#94a3b8" }}>{c.gender}</td>
                              <td style={{ padding:"10px 16px", color:"#94a3b8" }}>{c.district}</td>
                              <td style={{ padding:"10px 16px" }}>
                                <span style={{ fontSize:11, padding:"2px 8px", borderRadius:999, fontWeight:500, color:rc.color, background:rc.bg }}>{c.risk}</span>
                              </td>
                              <td style={{ padding:"10px 16px", color:"#64748b", fontSize:12 }}>{c.reason}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {filtered.length === 0 && (
                      <div style={{ padding:32, textAlign:"center" as const, color:"#475569", fontSize:13 }}>No children match the selected filters.</div>
                    )}
                    {filtered.length > 30 && (
                      <div style={{ padding:"12px 24px", fontSize:12, color:"#475569", borderTop:"1px solid rgba(148,163,184,0.06)" }}>
                        Showing 30 of {filtered.length} children. Use filters to narrow down.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Alert banner */}
      <div className="glass" style={{ borderRadius:16, padding:20, display:"flex", alignItems:"flex-start", gap:12, border:"1px solid rgba(248,113,113,0.2)", background:"rgba(248,113,113,0.04)" }}>
        <AlertCircle size={16} color="#f87171" style={{ flexShrink:0, marginTop:2 }} />
        <p style={{ fontSize:13, color:"#cbd5e1" }}>
          <strong style={{ color:"#f87171" }}>{totalUnenrolled.toLocaleString()} eligible children</strong> remain unenrolled across all 5 schemes.
          Highest gaps in <strong style={{ color:"white" }}>Ballari (42%)</strong> and <strong style={{ color:"white" }}>Shivamogga (39%)</strong>.
          Door-to-door outreach and Anganwadi registration drives recommended.
        </p>
      </div>
    </div>
  );
}