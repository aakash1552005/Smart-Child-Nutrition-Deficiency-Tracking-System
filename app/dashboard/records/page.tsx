"use client";
import { useEffect, useState, useCallback } from "react";
import { Search, Filter, Download, RefreshCw } from "lucide-react";
import { fetchChildRecords } from "@/lib/supabase-data";
import { DISTRICTS } from "@/lib/mock-data";

const RISK_COLORS: Record<string,{color:string;bg:string}> = {
  High:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)" },
  Medium: { color:"#f59e0b", bg:"rgba(245,158,11,0.1)" },
  Low:    { color:"#14b8a6", bg:"rgba(20,184,166,0.1)" },
};

const PAGE_SIZE = 50;

export default function RecordsPage() {
  const [records, setRecords]   = useState<any[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(0);
  const [search, setSearch]     = useState("");
  const [district, setDistrict] = useState("All");
  const [risk, setRisk]         = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, count } = await fetchChildRecords({
      district, risk_level: risk, search,
      limit: PAGE_SIZE, offset: page * PAGE_SIZE,
    });
    setRecords(data);
    setTotal(count);
    setLoading(false);
  }, [district, risk, search, page]);

  useEffect(() => { load(); }, [load]);

  function exportCSV() {
    const headers = ["child_id","name","age_months","gender","district","weight_kg","height_cm","bmi","risk_level","scheme_enrolled"];
    const rows = records.map(r => headers.map(h => r[h] ?? "").join(","));
    const blob = new Blob([[headers.join(","), ...rows].join("\n")], { type:"text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `child_records_${district}_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const S = { padding:"8px 12px", background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)", borderRadius:8, color:"#cbd5e1", fontSize:13, outline:"none" };

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:"white" }}>Child Health Records</h1>
          <p style={{ fontSize:13, color:"#94a3b8", marginTop:2 }}>Live data from Supabase · {total.toLocaleString()} records</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={load} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer", background:"rgba(30,41,59,0.6)", border:"1px solid rgba(148,163,184,0.12)", color:"#94a3b8" }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer", background:"rgba(20,184,166,0.1)", border:"1px solid rgba(20,184,166,0.2)", color:"#14b8a6" }}>
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass" style={{ borderRadius:12, padding:16, marginBottom:16, display:"flex", gap:12, flexWrap:"wrap" as const, alignItems:"center" }}>
        <div style={{ position:"relative" as const, flex:1, minWidth:200 }}>
          <Search size={14} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#64748b" }} />
          <input placeholder="Search by name or ID..." value={search}
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
        <div style={{ overflowX:"auto" as const }}>
          <table style={{ width:"100%", borderCollapse:"collapse" as const, fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.08)" }}>
                {["Child ID","Name","Age","Gender","District","Weight","Height","BMI","Risk Level","Scheme"].map(h => (
                  <th key={h} style={{ padding:"10px 14px", textAlign:"left" as const, fontSize:11, fontWeight:600, color:"#475569", textTransform:"uppercase" as const, letterSpacing:"0.04em", whiteSpace:"nowrap" as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={10} style={{ padding:40, textAlign:"center" as const, color:"#475569" }}>Loading from Supabase...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={10} style={{ padding:40, textAlign:"center" as const, color:"#475569" }}>No records found</td></tr>
              ) : records.map((r, i) => {
                const rc = RISK_COLORS[r.risk_level] ?? RISK_COLORS.Low;
                return (
                  <tr key={r.child_id ?? i} className="table-row-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.04)" }}>
                    <td style={{ padding:"10px 14px", fontFamily:"monospace", fontSize:12, color:"#64748b" }}>{r.child_id}</td>
                    <td style={{ padding:"10px 14px", color:"white", fontWeight:500 }}>{r.name ?? "—"}</td>
                    <td style={{ padding:"10px 14px", color:"#94a3b8" }}>{r.age_months}m</td>
                    <td style={{ padding:"10px 14px", color:"#94a3b8" }}>{r.gender}</td>
                    <td style={{ padding:"10px 14px", color:"#94a3b8" }}>{r.district}</td>
                    <td style={{ padding:"10px 14px", color:"#94a3b8" }}>{r.weight_kg}kg</td>
                    <td style={{ padding:"10px 14px", color:"#94a3b8" }}>{r.height_cm}cm</td>
                    <td style={{ padding:"10px 14px", color:"#94a3b8" }}>{r.bmi}</td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ fontSize:11, padding:"2px 8px", borderRadius:999, fontWeight:500, color:rc.color, background:rc.bg }}>{r.risk_level}</span>
                    </td>
                    <td style={{ padding:"10px 14px" }}>
                      <span style={{ fontSize:11, color: r.scheme_enrolled ? "#34d399" : "#f87171" }}>{r.scheme_enrolled ? "✓ Yes" : "✗ No"}</span>
                    </td>
                  </tr>
                );
              })}
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
            style={{ padding:"6px 14px", borderRadius:8, fontSize:12, cursor: page===0?"not-allowed":"pointer", background:"rgba(30,41,59,0.6)", border:"1px solid rgba(148,163,184,0.12)", color: page===0?"#334155":"#94a3b8", opacity:page===0?0.5:1 }}>
            Previous
          </button>
          <button onClick={() => setPage(p => Math.min(totalPages-1,p+1))} disabled={page>=totalPages-1}
            style={{ padding:"6px 14px", borderRadius:8, fontSize:12, cursor: page>=totalPages-1?"not-allowed":"pointer", background:"rgba(30,41,59,0.6)", border:"1px solid rgba(148,163,184,0.12)", color: page>=totalPages-1?"#334155":"#94a3b8", opacity:page>=totalPages-1?0.5:1 }}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}