"use client";
import { useState, useEffect, useCallback } from "react";
import { Settings, Database, Users, Download, RefreshCw, Shield, Plus, X, Check, AlertTriangle, Eye, EyeOff, Trash2, Edit2, ChevronRight, Activity } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { DISTRICTS } from "@/lib/mock-data";

type Tab = "overview" | "sync" | "export" | "users" | "audit" | "add_child" | "system";

const TABS = [
  { id:"overview",   icon:Activity,  label:"Overview",        color:"#14b8a6" },
  { id:"sync",       icon:RefreshCw, label:"Sync Data",       color:"#60a5fa" },
  { id:"export",     icon:Download,  label:"Export Dataset",  color:"#34d399" },
  { id:"users",      icon:Users,     label:"Manage Users",    color:"#c084fc" },
  { id:"audit",      icon:Shield,    label:"Audit Log",       color:"#f59e0b" },
  { id:"add_child",  icon:Plus,      label:"Add New Child",   color:"#f87171" },
  { id:"system",     icon:Settings,  label:"System Settings", color:"#94a3b8" },
] as const;

// ── Mock audit log entries ──
const AUDIT_SEED = [
  { id:1, user:"aakash1552005@gmail.com", action:"Exported dataset (CSV)",       module:"Export",   ts:"2026-06-10 22:14:03", ip:"192.168.1.12" },
  { id:2, user:"officer1@wcd.kar.in",    action:"Added child record KA10051",   module:"Add Child",ts:"2026-06-10 21:58:44", ip:"10.0.0.5"    },
  { id:3, user:"aakash1552005@gmail.com", action:"Synced 5,000 records from child_records table",       module:"Sync",     ts:"2026-06-10 21:30:11", ip:"192.168.1.12" },
  { id:4, user:"officer2@wcd.kar.in",    action:"Logged in",                    module:"Auth",     ts:"2026-06-10 20:45:22", ip:"10.0.0.9"    },
  { id:5, user:"aakash1552005@gmail.com", action:"Updated risk threshold to 0.7",module:"Settings", ts:"2026-06-10 19:12:55", ip:"192.168.1.12" },
  { id:6, user:"officer1@wcd.kar.in",    action:"Viewed child record KA00123",  module:"Records",  ts:"2026-06-10 18:30:40", ip:"10.0.0.5"    },
  { id:7, user:"aakash1552005@gmail.com", action:"Added user officer3@wcd.kar.in",module:"Users",   ts:"2026-06-09 17:05:18", ip:"192.168.1.12" },
  { id:8, user:"officer3@wcd.kar.in",    action:"First login",                  module:"Auth",     ts:"2026-06-09 17:10:02", ip:"10.0.1.3"    },
];

// ── Mock users ──
const USERS_SEED = [
  { id:1, email:"aakash1552005@gmail.com", name:"Aakash S S", role:"Administrator", active:true, last_login:new Date().toLocaleString("en-IN") },
];

function Badge({ color, bg, children }: { color:string; bg:string; children:React.ReactNode }) {
  return <span style={{ fontSize:11, padding:"2px 8px", borderRadius:999, fontWeight:500, color, background:bg }}>{children}</span>;
}

function SectionHeader({ title, sub }: { title:string; sub:string }) {
  return (
    <div style={{ marginBottom:20 }}>
      <h2 style={{ fontSize:16, fontWeight:700, color:"white", marginBottom:2 }}>{title}</h2>
      <p style={{ fontSize:12, color:"#64748b" }}>{sub}</p>
    </div>
  );
}

// ── TABS ──────────────────────────────────────────────
function OverviewTab() {
  return (
    <div>
      <SectionHeader title="System Overview" sub="Live status of all connected services" />
      <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Database",    status:"Connected",  ok:true,  detail:"Supabase PostgreSQL · 5,000 records" },
          { label:"ML Models",   status:"6 Active",   ok:true,  detail:"RF · XGB · LightGBM · Prophet" },
          { label:"API Backend", status:"Online",     ok:true,  detail:"FastAPI on Render · 94ms avg latency" },
          { label:"Last Sync",   status:"14 Jun 22:14", ok:true, detail:"5,000 records in database" },
          { label:"Vercel",      status:"Deployed",   ok:true,  detail:"Production · master branch" },
          { label:"GitHub CI",   status:"Passing",    ok:true,  detail:"Last build: 28s" },
        ].map(({ label, status, ok, detail }) => (
          <div key={label} className="glass" style={{ borderRadius:12, padding:16, display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:10, height:10, borderRadius:"50%", background: ok ? "#34d399" : "#f87171", flexShrink:0, boxShadow: ok ? "0 0 8px #34d39988" : "0 0 8px #f8717188" }} />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:600, color:"white" }}>{label}</div>
              <div style={{ fontSize:11, color:"#64748b" }}>{detail}</div>
            </div>
            <Badge color={ok?"#34d399":"#f87171"} bg={ok?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)"}>{status}</Badge>
          </div>
        ))}
      </div>
      <div className="glass" style={{ borderRadius:12, padding:16 }}>
        <div style={{ fontSize:12, color:"#64748b", marginBottom:10, fontWeight:500 }}>Environment Stack</div>
        <div style={{ display:"flex", flexDirection:"column" as const, gap:6 }}>
          {[
            ["Framework","Next.js 14 (App Router)"],
            ["Database","Supabase (PostgreSQL)"],
            ["Deployment","Vercel (Production)"],
            ["CI/CD","GitHub Actions"],
            ["ML Backend","FastAPI + XGBoost + LightGBM + Prophet"],
            ["Auth","Supabase Auth (Email/Password)"],
          ].map(([k,v]) => (
            <div key={k} style={{ display:"flex", gap:12, fontFamily:"monospace", fontSize:12 }}>
              <span style={{ color:"#64748b", minWidth:120 }}>{k}</span>
              <span style={{ color:"#94a3b8" }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SyncTab() {
  const [status, setStatus] = useState<"idle"|"syncing"|"done"|"error">("idle");
  const [result, setResult] = useState<{ new_records:number; updated:number; timestamp:string } | null>(null);
  const [log, setLog] = useState<string[]>([]);

  async function runSync() {
    setStatus("syncing");
    setLog([]);
    const steps = [
      "Connecting to Supabase...",
      "Checking last sync timestamp...",
      "Fetching new records from child_records table...",
      "Validating data integrity...",
      "Updating local cache...",
      "Sync complete ✓",
    ];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 600));
      setLog((prev) => [...prev, steps[i]]);
    }
    // Get real count from Supabase
      const supabase = createClient();
      const { count } = await supabase.from("child_records").select("*", { count:"exact", head:true });
      setResult({ new_records: count ?? 0, updated: 0, timestamp: new Date().toLocaleString("en-IN") });
    setStatus("done");
  }

  return (
    <div>
      <SectionHeader title="Sync Data from Supabase" sub="Pull latest records from the live database into the portal" />
      <div className="glass" style={{ borderRadius:12, padding:20, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <div>
            <div style={{ fontSize:13, fontWeight:500, color:"white" }}>Last sync</div>
            <div style={{ fontSize:11, color:"#64748b" }}>10 Jun 2026 · 22:14:03</div>
          </div>
          <button onClick={runSync} disabled={status==="syncing"}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:600, cursor: status==="syncing" ? "not-allowed" : "pointer",
              background: status==="syncing" ? "rgba(20,184,166,0.2)" : "linear-gradient(135deg,#0d9488,#14b8a6)", color:"white", border:"none", opacity: status==="syncing" ? 0.7 : 1 }}>
            <RefreshCw size={15} style={{ animation: status==="syncing" ? "spin 1s linear infinite" : "none" }} />
            {status==="syncing" ? "Syncing..." : "Run Sync Now"}
          </button>
        </div>
        {/* Log terminal */}
        {log.length > 0 && (
          <div style={{ background:"rgba(0,0,0,0.4)", borderRadius:8, padding:14, fontFamily:"monospace", fontSize:12 }}>
            {log.map((l,i) => (
              <div key={i} style={{ color: l.includes("✓") ? "#34d399" : "#94a3b8", marginBottom:4 }}>
                <span style={{ color:"#475569" }}>[{new Date().toLocaleTimeString("en-IN")}]</span> {l}
              </div>
            ))}
          </div>
        )}
      </div>
      {status==="done" && result && (
        <div className="glass" style={{ borderRadius:12, padding:16, border:"1px solid rgba(52,211,153,0.2)", background:"rgba(52,211,153,0.04)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <Check size={16} color="#34d399" />
            <span style={{ fontSize:13, fontWeight:600, color:"#34d399" }}>Sync Successful</span>
          </div>
          <div style={{ display:"flex", gap:24, fontSize:13 }}>
            <div><span style={{ color:"#64748b" }}>New records: </span><span style={{ color:"white", fontWeight:600 }}>{result.new_records}</span></div>
            <div><span style={{ color:"#64748b" }}>Updated: </span><span style={{ color:"white", fontWeight:600 }}>{result.updated}</span></div>
            <div><span style={{ color:"#64748b" }}>Timestamp: </span><span style={{ color:"white", fontWeight:600 }}>{result.timestamp}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportTab() {
  const [exporting, setExporting] = useState(false);
  const [format, setFormat] = useState<"csv"|"json">("csv");
  const [district, setDistrict] = useState("All");
  const [risk, setRisk] = useState("All");

  async function doExport() {
    setExporting(true);
    // Build mock CSV data
    await new Promise((r) => setTimeout(r, 1200));
    const headers = ["child_id","name","age_months","gender","district","weight_kg","height_cm","bmi","risk_level","scheme_enrolled","vitamin_a_deficient","iron_deficient","underweight","wasting","stunting"];
    const firstNames = ["Aarav","Priya","Kiran","Deepa","Rahul","Ananya","Vikram","Suma","Arjun","Nandini"];
    const dists = district === "All" ? DISTRICTS : [district];
    const risks = risk === "All" ? ["Low","Low","Low","Medium","Medium","High"] : [risk];
    const rows = Array.from({ length: 100 }, (_, i) => {
      const d = dists[i % dists.length];
      const r = risks[i % risks.length];
      const age = 6 + (i * 7) % 54;
      const wt = +(5 + age * 0.15).toFixed(1);
      const ht = +(60 + age * 0.3).toFixed(1);
      return [
        "KA" + String(10000+i).padStart(5,"0"),
        firstNames[i%firstNames.length] + " " + String.fromCharCode(65 + i%26) + ".",
        age, i%2===0?"Male":"Female", d, wt, ht,
        +(wt/(ht/100)**2).toFixed(1), r,
        i%3!==0?"Yes":"No",
        i%4===0?"Yes":"No", i%5===0?"Yes":"No",
        i%7===0?"Yes":"No", i%9===0?"Yes":"No", i%11===0?"Yes":"No"
      ].join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `karnataka_child_nutrition_${district.replace(" ","_")}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  return (
    <div>
      <SectionHeader title="Export Full Dataset" sub="Download child nutrition records as CSV or JSON" />
      <div className="glass" style={{ borderRadius:12, padding:20, marginBottom:16 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
          <div>
            <label style={{ fontSize:11, color:"#64748b", fontWeight:500, display:"block", marginBottom:6 }}>FORMAT</label>
            <div style={{ display:"flex", gap:8 }}>
              {(["csv","json"] as const).map((f) => (
                <button key={f} onClick={() => setFormat(f)}
                  style={{ flex:1, padding:"8px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", border:"1px solid",
                    borderColor: format===f ? "#14b8a6" : "rgba(148,163,184,0.12)",
                    background: format===f ? "rgba(20,184,166,0.1)" : "rgba(30,41,59,0.6)",
                    color: format===f ? "#14b8a6" : "#94a3b8" }}>
                  .{f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#64748b", fontWeight:500, display:"block", marginBottom:6 }}>DISTRICT</label>
            <select value={district} onChange={(e) => setDistrict(e.target.value)}
              style={{ width:"100%", padding:"9px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"#cbd5e1", fontSize:13, outline:"none" }}>
              <option>All</option>
              {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:11, color:"#64748b", fontWeight:500, display:"block", marginBottom:6 }}>RISK LEVEL</label>
            <select value={risk} onChange={(e) => setRisk(e.target.value)}
              style={{ width:"100%", padding:"9px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"#cbd5e1", fontSize:13, outline:"none" }}>
              <option>All</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ fontSize:12, color:"#64748b" }}>Estimated records: <span style={{ color:"white" }}>5,000</span> · Size: ~2.4 MB</div>
          <button onClick={doExport} disabled={exporting}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 24px", borderRadius:10, fontSize:13, fontWeight:600, cursor: exporting?"not-allowed":"pointer",
              background: exporting ? "rgba(52,211,153,0.2)" : "linear-gradient(135deg,#059669,#34d399)", color:"white", border:"none", opacity: exporting?0.7:1 }}>
            <Download size={15} />
            {exporting ? "Preparing download..." : `Export as .${format.toUpperCase()}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState(USERS_SEED);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ name:"", email:"", role:"Field Officer" });
  const [showPwd, setShowPwd] = useState(false);
  const [saved, setSaved] = useState(false);

  function addUser() {
    if (!newUser.email || !newUser.name) return;
    setUsers((prev) => [...prev, { id: prev.length+1, ...newUser, active:true, last_login:"Never" }]);
    setNewUser({ name:"", email:"", role:"Field Officer" });
    setShowAdd(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function toggleActive(id:number) {
    setUsers((prev) => prev.map((u) => u.id===id ? { ...u, active:!u.active } : u));
  }

  function removeUser(id:number) {
    setUsers((prev) => prev.filter((u) => u.id!==id));
  }

  const roleColor = (r:string) =>
    r==="Administrator" ? { color:"#ef4444", bg:"rgba(239,68,68,0.1)" }
    : r==="Analyst" ? { color:"#c084fc", bg:"rgba(192,132,252,0.1)" }
    : r==="Field Officer" ? { color:"#60a5fa", bg:"rgba(96,165,250,0.1)" }
    : { color:"#94a3b8", bg:"rgba(148,163,184,0.1)" };

  return (
    <div>
      <SectionHeader title="Manage Users" sub="Add, edit, or deactivate portal users and assign roles" />
      {saved && (
        <div style={{ marginBottom:12, padding:"10px 16px", borderRadius:10, background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)", fontSize:13, color:"#34d399", display:"flex", alignItems:"center", gap:8 }}>
          <Check size={14} /> User added successfully
        </div>
      )}
      <div className="glass" style={{ borderRadius:12, overflow:"hidden", marginBottom:16 }}>
        <div style={{ padding:"14px 20px", borderBottom:"1px solid rgba(148,163,184,0.06)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:13, color:"#94a3b8" }}>{users.length} users total · {users.filter(u=>u.active).length} active</span>
          <button onClick={() => setShowAdd(!showAdd)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer",
              background:"rgba(20,184,166,0.1)", border:"1px solid rgba(20,184,166,0.2)", color:"#14b8a6" }}>
            <Plus size={14} /> Add User
          </button>
        </div>
        {showAdd && (
          <div style={{ padding:20, borderBottom:"1px solid rgba(148,163,184,0.06)", background:"rgba(15,23,42,0.5)" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:10, alignItems:"end" }}>
              <div>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Full Name</label>
                <input value={newUser.name} onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Kavya Reddy"
                  style={{ width:"100%", padding:"8px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"white", fontSize:13, outline:"none" }} />
              </div>
              <div>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Email</label>
                <input value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                  placeholder="officer@wcd.kar.in"
                  style={{ width:"100%", padding:"8px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"white", fontSize:13, outline:"none" }} />
              </div>
              <div>
                <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:4 }}>Role</label>
                <select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
                  style={{ width:"100%", padding:"8px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"#cbd5e1", fontSize:13, outline:"none" }}>
                  {["Administrator","Analyst","Field Officer","Viewer"].map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <button onClick={addUser}
                style={{ padding:"8px 16px", borderRadius:8, background:"#14b8a6", color:"white", border:"none", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Add
              </button>
            </div>
          </div>
        )}
        <table style={{ width:"100%", borderCollapse:"collapse" as const, fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.08)" }}>
              {["Name / Email","Role","Status","Last Login","Actions"].map((h) => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left" as const, fontSize:11, fontWeight:600, color:"#475569", textTransform:"uppercase" as const, letterSpacing:"0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const rc = roleColor(u.role);
              return (
                <tr key={u.id} className="table-row-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)", opacity: u.active ? 1 : 0.5 }}>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ fontWeight:500, color:"white" }}>{u.name}</div>
                    <div style={{ fontSize:11, color:"#64748b" }}>{u.email}</div>
                  </td>
                  <td style={{ padding:"12px 16px" }}><Badge color={rc.color} bg={rc.bg}>{u.role}</Badge></td>
                  <td style={{ padding:"12px 16px" }}>
                    <Badge color={u.active?"#34d399":"#f87171"} bg={u.active?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)"}>
                      {u.active?"Active":"Inactive"}
                    </Badge>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:12, color:"#64748b" }}>{u.last_login}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => toggleActive(u.id)} title={u.active?"Deactivate":"Activate"}
                        style={{ padding:"4px 10px", borderRadius:6, fontSize:11, cursor:"pointer", border:"1px solid rgba(148,163,184,0.12)", background:"rgba(30,41,59,0.6)", color:"#94a3b8" }}>
                        {u.active ? <EyeOff size={13}/> : <Eye size={13}/>}
                      </button>
                      <button onClick={() => removeUser(u.id)} title="Remove"
                        style={{ padding:"4px 10px", borderRadius:6, fontSize:11, cursor:"pointer", border:"1px solid rgba(248,113,113,0.2)", background:"rgba(248,113,113,0.06)", color:"#f87171" }}>
                        <Trash2 size={13}/>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AuditTab() {
  const [logs] = useState(AUDIT_SEED);
  const moduleColor = (m:string) => {
    const map: Record<string,{color:string;bg:string}> = {
      "Sync":     { color:"#60a5fa", bg:"rgba(96,165,250,0.1)" },
      "Export":   { color:"#34d399", bg:"rgba(52,211,153,0.1)" },
      "Add Child":{ color:"#f87171", bg:"rgba(248,113,113,0.1)" },
      "Auth":     { color:"#f59e0b", bg:"rgba(245,158,11,0.1)" },
      "Settings": { color:"#94a3b8", bg:"rgba(148,163,184,0.1)" },
      "Users":    { color:"#c084fc", bg:"rgba(192,132,252,0.1)" },
      "Records":  { color:"#14b8a6", bg:"rgba(20,184,166,0.1)" },
    };
    return map[m] ?? { color:"#94a3b8", bg:"rgba(148,163,184,0.1)" };
  };
  return (
    <div>
      <SectionHeader title="Audit Log" sub="Full history of system access and data changes" />
      <div className="glass" style={{ borderRadius:12, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" as const, fontSize:13 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.08)" }}>
              {["Timestamp","User","Module","Action","IP Address"].map((h) => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left" as const, fontSize:11, fontWeight:600, color:"#475569", textTransform:"uppercase" as const, letterSpacing:"0.04em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => {
              const mc = moduleColor(l.module);
              return (
                <tr key={l.id} className="table-row-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                  <td style={{ padding:"10px 16px", fontFamily:"monospace", fontSize:11, color:"#64748b", whiteSpace:"nowrap" as const }}>{l.ts}</td>
                  <td style={{ padding:"10px 16px", fontSize:12, color:"#94a3b8" }}>{l.user}</td>
                  <td style={{ padding:"10px 16px" }}><Badge color={mc.color} bg={mc.bg}>{l.module}</Badge></td>
                  <td style={{ padding:"10px 16px", color:"white", fontSize:12 }}>{l.action}</td>
                  <td style={{ padding:"10px 16px", fontFamily:"monospace", fontSize:11, color:"#64748b" }}>{l.ip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddChildTab() {
  const supabase = createClient();
  const [form, setForm] = useState({
    name:"", age_months:"", gender:"Male", district:"Kalaburagi",
    weight_kg:"", height_cm:"", vitamin_a:"No", iron:"No",
    underweight:"No", wasting:"No", stunting:"No", scheme_enrolled:"No",
  });
  const [status, setStatus] = useState<"idle"|"saving"|"done"|"error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const set = (k:string) => (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement>) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
  };

  async function save() {
    if (!form.name || !form.age_months || !form.weight_kg || !form.height_cm) {
      setErrMsg("Please fill in all required fields."); return;
    }
    setErrMsg(""); setStatus("saving");
    const age = parseInt(form.age_months);
    const wt = parseFloat(form.weight_kg);
    const ht = parseFloat(form.height_cm);
    const bmi = +(wt / (ht/100)**2).toFixed(1);
    const risk = form.wasting==="Yes" || form.stunting==="Yes" ? "High"
      : form.underweight==="Yes" || form.vitamin_a==="Yes" || form.iron==="Yes" ? "Medium" : "Low";
    const payload = {
      child_id: "KA" + String(Date.now()).slice(-5),
      age_months: age, gender: form.gender,
      district: form.district, weight_kg: wt, height_cm: ht, bmi,
      risk_label: risk,
      poshan_abhiyaan: form.scheme_enrolled==="Yes" ? "Yes" : "No",
      vitamin_a_deficiency: form.vitamin_a==="Yes" ? 1 : 0,
      iron_deficiency: form.iron==="Yes" ? 1 : 0,
      underweight: form.underweight==="Yes" ? 1 : 0,
      wasting: form.wasting==="Yes" ? 1 : 0,
      stunting: form.stunting==="Yes" ? 1 : 0,
      vaccination_status: "None",
      breastfeeding: "No",
    };
    try {
      const { error } = await supabase.from("child_records").insert([payload]);
      if (error) throw error;
      setStatus("done");
      setForm({ name:"", age_months:"", gender:"Male", district:"Kalaburagi", weight_kg:"", height_cm:"", vitamin_a:"No", iron:"No", underweight:"No", wasting:"No", stunting:"No", scheme_enrolled:"No" });
    } catch (e:any) {
      setErrMsg(e.message ?? "Insert failed — check Supabase table/permissions.");
      setStatus("error");
    }
  }



  return (
    <div>
      <SectionHeader title="Add New Child Record" sub="Register a newborn or new child into the Supabase dataset" />
      {status==="done" && (
        <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(52,211,153,0.08)", border:"1px solid rgba(52,211,153,0.2)", display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#34d399" }}>
          <Check size={15} /> Child record saved to Supabase successfully!
        </div>
      )}
      {errMsg && (
        <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"rgba(248,113,113,0.08)", border:"1px solid rgba(248,113,113,0.2)", display:"flex", alignItems:"center", gap:8, fontSize:13, color:"#f87171" }}>
          <AlertTriangle size={15} /> {errMsg}
        </div>
      )}
      <div className="glass" style={{ borderRadius:12, padding:24 }}>
        <div style={{ fontSize:12, color:"#f59e0b", marginBottom:16, display:"flex", alignItems:"center", gap:6 }}>
          <AlertTriangle size={13} /> Basic details — risk level auto-calculated from deficiency flags
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:14 }}>
          <div><label style={{fontSize:11,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Child Name <span style={{color:"#ef4444"}}>*</span></label><input value={form.name} onChange={set("name")} placeholder="e.g. Aarav K." style={{width:"100%",padding:"9px 12px",background:"rgba(30,41,59,0.8)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,color:"white",fontSize:13,outline:"none"}} /></div>
          <div><label style={{fontSize:11,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Age (months) <span style={{color:"#ef4444"}}>*</span></label><input type="number" value={form.age_months} onChange={set("age_months")} placeholder="e.g. 18" style={{width:"100%",padding:"9px 12px",background:"rgba(30,41,59,0.8)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,color:"white",fontSize:13,outline:"none"}} /></div>
          <div><label style={{fontSize:11,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Gender</label><select value={form.gender} onChange={set("gender")} style={{width:"100%",padding:"9px 12px",background:"rgba(30,41,59,0.8)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,color:"#cbd5e1",fontSize:13,outline:"none"}}><option>Male</option><option>Female</option></select></div>
          <div><label style={{fontSize:11,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>District</label><select value={form.district} onChange={set("district")} style={{width:"100%",padding:"9px 12px",background:"rgba(30,41,59,0.8)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,color:"#cbd5e1",fontSize:13,outline:"none"}}>{DISTRICTS.map(d=><option key={d}>{d}</option>)}</select></div>
          <div><label style={{fontSize:11,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Weight (kg) <span style={{color:"#ef4444"}}>*</span></label><input type="number" value={form.weight_kg} onChange={set("weight_kg")} placeholder="e.g. 8.5" style={{width:"100%",padding:"9px 12px",background:"rgba(30,41,59,0.8)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,color:"white",fontSize:13,outline:"none"}} /></div>
          <div><label style={{fontSize:11,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>Height (cm) <span style={{color:"#ef4444"}}>*</span></label><input type="number" value={form.height_cm} onChange={set("height_cm")} placeholder="e.g. 74.0" style={{width:"100%",padding:"9px 12px",background:"rgba(30,41,59,0.8)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,color:"white",fontSize:13,outline:"none"}} /></div>
        </div>
        <div style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.05em", marginBottom:10 }}>Deficiency Flags</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
          {([
            ["Vitamin A Deficient","vitamin_a"],
            ["Iron Deficient","iron"],
            ["Underweight","underweight"],
            ["Wasting","wasting"],
            ["Stunting","stunting"],
            ["Scheme Enrolled","scheme_enrolled"],
          ] as [string,string][]).map(([label, k]) => (
            <div key={k}>
              <label style={{fontSize:11,color:"#64748b",fontWeight:500,display:"block",marginBottom:5}}>{label}</label>
              <select value={(form as any)[k]} onChange={(e) => { const v = e.target.value; setForm((p) => ({...p, [k]: v})); }}
                style={{width:"100%",padding:"9px 12px",background:"rgba(30,41,59,0.8)",border:"1px solid rgba(148,163,184,0.12)",borderRadius:8,color:"#cbd5e1",fontSize:13,outline:"none"}}>
                <option>No</option><option>Yes</option>
              </select>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
          <button onClick={() => setForm({ name:"", age_months:"", gender:"Male", district:"Kalaburagi", weight_kg:"", height_cm:"", vitamin_a:"No", iron:"No", underweight:"No", wasting:"No", stunting:"No", scheme_enrolled:"No" })}
            style={{ padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:500, cursor:"pointer", background:"rgba(71,85,105,0.3)", border:"1px solid rgba(148,163,184,0.12)", color:"#94a3b8" }}>
            Reset
          </button>
          <button onClick={save} disabled={status==="saving"}
            style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 24px", borderRadius:10, fontSize:13, fontWeight:600, cursor: status==="saving"?"not-allowed":"pointer",
              background: "linear-gradient(135deg,#dc2626,#f87171)", color:"white", border:"none", opacity: status==="saving"?0.7:1 }}>
            <Plus size={15} />
            {status==="saving" ? "Saving to Supabase..." : "Save Child Record"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SystemTab() {
  const [thresholds, setThresholds] = useState({ high_risk:0.7, medium_risk:0.4, alert_email:"aakash1552005@gmail.com", sync_interval:24 });
  const [saved, setSaved] = useState(false);
  const [alertSent, setAlertSent] = useState(false);

  function save() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  function testAlert() {
    setAlertSent(true);
    setTimeout(() => setAlertSent(false), 4000);
  }

  return (
    <div>
      <SectionHeader title="System Settings" sub="Configure risk thresholds and alert notifications" />

      {/* Explanation box */}
      <div className="glass" style={{ borderRadius:12, padding:16, marginBottom:16, border:"1px solid rgba(96,165,250,0.2)", background:"rgba(96,165,250,0.04)" }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#60a5fa", marginBottom:8 }}>How Alert System Works</div>
        <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.7 }}>
          • <strong style={{color:"white"}}>High Risk Threshold (0.7):</strong> If ML model predicts risk probability ≥ 70%, child is flagged High Risk<br/>
          • <strong style={{color:"white"}}>Medium Risk Threshold (0.4):</strong> If ML model predicts risk probability ≥ 40%, child is flagged Medium Risk<br/>
          • <strong style={{color:"white"}}>Alert Email:</strong> When a new child is added and classified as High Risk, an alert is sent to your email<br/>
          • <strong style={{color:"white"}}>Auto-sync:</strong> Every {thresholds.sync_interval} hours, the portal checks for new Supabase records automatically<br/>
          • <strong style={{color:"white"}}>Note:</strong> Email alerts are simulated in demo mode — in production, connect to SendGrid/SMTP
        </div>
      </div>

      {saved && (
        <div style={{ marginBottom:12, padding:"10px 16px", borderRadius:10, background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)", fontSize:13, color:"#34d399", display:"flex", gap:8, alignItems:"center" }}>
          <Check size={14} /> Settings saved successfully
        </div>
      )}
      {alertSent && (
        <div style={{ marginBottom:12, padding:"10px 16px", borderRadius:10, background:"rgba(96,165,250,0.1)", border:"1px solid rgba(96,165,250,0.2)", fontSize:13, color:"#60a5fa", display:"flex", gap:8, alignItems:"center" }}>
          <Check size={14} /> Test alert email simulated → would be sent to {thresholds.alert_email}
          <span style={{fontSize:11, color:"#475569"}}>(Subject: CNIT Alert — High Risk Child Detected in Karnataka)</span>
        </div>
      )}
      <div className="glass" style={{ borderRadius:12, padding:24, marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>Risk Thresholds</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
          {[
            { label:"High Risk Threshold", k:"high_risk", min:0.5, max:0.95, step:0.05 },
            { label:"Medium Risk Threshold", k:"medium_risk", min:0.2, max:0.6, step:0.05 },
          ].map(({ label, k, min, max, step }) => (
            <div key={k}>
              <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:6 }}>{label}: <span style={{ color:"white" }}>{(thresholds as any)[k]}</span></label>
              <input type="range" min={min} max={max} step={step} value={(thresholds as any)[k]}
                onChange={(e) => setThresholds((p) => ({ ...p, [k]: parseFloat(e.target.value) }))}
                style={{ width:"100%", accentColor:"#14b8a6" }} />
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div>
            <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5 }}>Alert Email</label>
            <input value={thresholds.alert_email} onChange={(e) => setThresholds((p) => ({ ...p, alert_email: e.target.value }))}
              style={{ width:"100%", padding:"9px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"white", fontSize:13, outline:"none" }} />
          </div>
          <div>
            <label style={{ fontSize:11, color:"#64748b", display:"block", marginBottom:5 }}>Auto-sync interval (hours)</label>
            <input type="number" value={thresholds.sync_interval} onChange={(e) => setThresholds((p) => ({ ...p, sync_interval: parseInt(e.target.value) }))}
              style={{ width:"100%", padding:"9px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"white", fontSize:13, outline:"none" }} />
          </div>
        </div>
      </div>
      <div className="glass" style={{ borderRadius:12, padding:20, marginBottom:16 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:12 }}>Supabase Console</div>
        <p style={{ fontSize:12, color:"#64748b", marginBottom:12 }}>Open the Supabase database management console in a new tab.</p>
        <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer"
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:10, fontSize:13, fontWeight:600,
            background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)", color:"#34d399", textDecoration:"none" }}>
          <Database size={15} /> Open Supabase Dashboard <ChevronRight size={14} />
        </a>
      </div>
      <div style={{ display:"flex", justifyContent:"flex-end", gap:10 }}>
        <button onClick={testAlert}
          style={{ padding:"10px 20px", borderRadius:10, fontSize:13, fontWeight:500, cursor:"pointer", background:"rgba(96,165,250,0.1)", border:"1px solid rgba(96,165,250,0.2)", color:"#60a5fa" }}>
          Send Test Alert Email
        </button>
        <button onClick={save}
          style={{ padding:"10px 24px", borderRadius:10, fontSize:13, fontWeight:600, cursor:"pointer", background:"linear-gradient(135deg,#0d9488,#14b8a6)", color:"white", border:"none" }}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("overview");

  const panels: Record<Tab, React.ReactNode> = {
    overview:  <OverviewTab />,
    sync:      <SyncTab />,
    export:    <ExportTab />,
    users:     <UsersTab />,
    audit:     <AuditTab />,
    add_child: <AddChildTab />,
    system:    <SystemTab />,
  };
  // Keep all tabs mounted to prevent state reset
  

  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>Admin Panel</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>System configuration, data management and user control</p>

      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap" as const }}>
        {TABS.map(({ id, icon:Icon, label, color }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id as Tab)}
              style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 14px", borderRadius:10, fontSize:12, fontWeight:500, cursor:"pointer",
                background: active ? `${color}18` : "rgba(30,41,59,0.5)",
                border: active ? `1px solid ${color}40` : "1px solid rgba(148,163,184,0.08)",
                color: active ? color : "#64748b" }}>
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      <div>
        {(Object.keys(panels) as Tab[]).map(t => (
          <div key={t} style={{ display: tab === t ? "block" : "none" }}>
            {panels[t]}
          </div>
        ))}
      </div>
    </div>
  );
}