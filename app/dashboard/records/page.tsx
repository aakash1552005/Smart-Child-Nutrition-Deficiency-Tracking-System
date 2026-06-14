"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, Download, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { DISTRICTS } from "@/lib/mock-data";

const RISK_COLORS: Record<string,{color:string;bg:string}> = {
  High:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)" },
  Medium: { color:"#f59e0b", bg:"rgba(245,158,11,0.1)" },
  Low:    { color:"#14b8a6", bg:"rgba(20,184,166,0.1)" },
};

const BOOL_COLS = ["vaccination_status","breastfeeding","mid_day_meal","icds_enrolled","poshan_abhiyaan","iron_deficiency","vitamin_a_deficiency","protein_deficiency","zinc_deficiency","stunting","wasting","underweight"];

const DISPLAY_COLS = [
  "child_id","age_months","gender","district","height_cm","weight_kg","bmi",
  "haz","waz","whz","risk_label","family_income","mother_education","household_size",
  "vaccination_status","breastfeeding","mid_day_meal","icds_enrolled","poshan_abhiyaan",
  "iron_deficiency","vitamin_a_deficiency","protein_deficiency","zinc_deficiency",
  "stunting","wasting","underweight"
];

const COL_LABELS: Record<string,string> = {
  child_id:"Child ID", age_months:"Age", gender:"Gender", district:"District",
  height_cm:"Height", weight_kg:"Weight", bmi:"BMI", haz:"HAZ", waz:"WAZ", whz:"WHZ",
  risk_label:"Risk", family_income:"Income", mother_education:"Mother Edu",
  household_size:"HH Size", vaccination_status:"Vaccinated", breastfeeding:"Breastfed",
  mid_day_meal:"Mid-Day Meal", icds_enrolled:"ICDS", poshan_abhiyaan:"POSHAN",
  iron_deficiency:"Iron Def.", vitamin_a_deficiency:"Vit-A Def.",
  protein_deficiency:"Protein Def.", zinc_deficiency:"Zinc Def.",
  stunting:"Stunting", wasting:"Wasting", underweight:"Underweight",
};

const PAGE_SIZE = 50;

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(0);
  const [search, setSearch]   = useState("");
  const [district, setDistrict] = useState("All");
  const [risk, setRisk]       = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase.from("child_records").select("*", { count:"exact" });
    if (district !== "All") query = query.eq("district", district);
    if (risk !== "All") query = query.eq("risk_label", risk);
    if (search) query = query.ilike("child_id", `%${search}%`);
    query = query.order("child_id").range(page*PAGE_SIZE, (page+1)*PAGE_SIZE-1);
    const { data, count } = await query;
    setRecords(data ?? []);
    setTotal(count ?? 0);
    setLoading(false);
  }, [district, risk, search, page]);

  useEffect(() => { load(); }, [load]);

  function exportCSV() {
    if (!records.length) return;
    const rows = records.map(r => DISPLAY_COLS.map(c => r[c] ?? "").join(","));
    const blob = new Blob([[DISPLAY_COLS.join(","), ...rows].join("\n")], { type:"text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `child_records_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  function fmtVal(col: string, val: any) {
    if (val === null || val === undefined) return <span style={{ color:"#334155" }}>—</span>;
    if (col === "risk_label") {
      const rc = RISK_COLORS[val] ?? RISK_COLORS.Low;
      return <span style={{ fontSize:11, padding:"2px 8px", borderRadius:999, fontWeight:600, color:rc.color, background:rc.bg }}>{val}</span>;
    }
    if (BOOL_COLS.includes(col)) {
      const yes = val===true||val==="true"||val===1||val==="1"||val==="Yes"||val==="yes";
      return <span style={{ fontSize:12, color: yes ? "#34d399" : "#f87171" }}>{yes ? "✓" : "✗"}</span>;
    }
    if (col === "weight_kg") return <span style={{ color:"#cbd5e1" }}>{val}kg</span>;
    if (col === "height_cm") return <span style={{ color:"#cbd5e1" }}>{val}cm</span>;
    if (col === "age_months") return <span style={{ color:"#cbd5e1" }}>{val}m</span>;
    if (typeof val === "number") return <span style={{ color:"#94a3b8" }}>{+val.toFixed(2)}</span>;
    return <span style={{ color:"#94a3b8" }}>{String(val)}</span>;
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const S = { padding:"8px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"#cbd5e1", fontSize:13, outline:"none" } as const;

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:"white" }}>Child Health Records</h1>
          <p style={{ fontSize:13, color:"#94a3b8", marginTop:2 }}>Live data from Supabase · {total.toLocaleString()} records · 26 attributes</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={load} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer", background:"rgba(30,41,59,0.6)", border:"1px solid rgba(148,163,184,0.12)", color:"#94a3b8" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer", background:"rgba(20,184,166,0.1)", border:"1px solid rgba(20,184,166,0.2)", color:"#14b8a6" }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass" style={{ borderRadius:12, padding:16, marginBottom:16, display:"flex", gap:12, flexWrap:"wrap" as const, alignItems:"center" }}>
        <div style={{ position:"relative" as const, flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }} />
          <input placeholder="Search by Child ID (e.g. KA00001)..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            style={{ ...S, width:"100%", paddingLeft:32 }} />
        </div>
        <select value={district} onChange={e => { setDistrict(e.target.value); setPage(0); }} style={S}>
          <option>All</option>
          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={risk} onChange={e => { setRisk(e.target.value); setPage(0); }} style={S}>
          <option>All</option>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
        <span style={{ fontSize:12, color:"#64748b" }}>{total.toLocaleString()} results</span>
      </div>

      {/* Table */}
      <div className="glass" style={{ borderRadius:12, overflow:"hidden", marginBottom:16 }}>
        <div style={{ overflowX:"auto" as const, maxHeight:"60vh", overflowY:"auto" as const }}>
          <table style={{ width:"100%", borderCollapse:"collapse" as const, fontSize:12 }}>
            <thead style={{ position:"sticky" as const, top:0, background:"rgba(15,23,42,0.98)", zIndex:10 }}>
              <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.1)" }}>
                {DISPLAY_COLS.map(col => (
                  <th key={col} style={{ padding:"10px 12px", textAlign:"left" as const, fontSize:10, fontWeight:600, color:"#475569", textTransform:"uppercase" as const, letterSpacing:"0.04em", whiteSpace:"nowrap" as const }}>
                    {COL_LABELS[col] ?? col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={DISPLAY_COLS.length} style={{ padding:40, textAlign:"center" as const, color:"#475569" }}>Loading from Supabase...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={DISPLAY_COLS.length} style={{ padding:40, textAlign:"center" as const, color:"#475569" }}>No records found</td></tr>
              ) : records.map((r, i) => (
                <tr key={r.child_id ?? i} className="table-row-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                  {DISPLAY_COLS.map(col => (
                    <td key={col} style={{ padding:"8px 12px", fontFamily: col==="child_id" ? "monospace" : "inherit", whiteSpace:"nowrap" as const }}>
                      {fmtVal(col, r[col])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:12, color:"#64748b" }}>
          Page {page+1} of {totalPages} · Showing {records.length} of {total.toLocaleString()} records
        </span>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setPage(p => Math.max(0,p-1))} disabled={page===0}
            style={{ padding:"6px 16px", borderRadius:8, fontSize:12, cursor:page===0?"not-allowed":"pointer", background:"rgba(30,41,59,0.6)", border:"1px solid rgba(148,163,184,0.12)", color:page===0?"#334155":"#94a3b8", opacity:page===0?0.5:1 }}>
            ← Previous
          </button>
          <span style={{ padding:"6px 12px", fontSize:12, color:"#64748b" }}>{page+1} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1}
            style={{ padding:"6px 16px", borderRadius:8, fontSize:12, cursor:page>=totalPages-1?"not-allowed":"pointer", background:"rgba(30,41,59,0.6)", border:"1px solid rgba(148,163,184,0.12)", color:page>=totalPages-1?"#334155":"#94a3b8", opacity:page>=totalPages-1?0.5:1 }}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}