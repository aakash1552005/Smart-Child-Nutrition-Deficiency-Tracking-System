"use client";
import { useState, useMemo } from "react";
import { Search, Download } from "lucide-react";
import { mockChildren, DISTRICTS } from "@/lib/mock-data";

const CHILDREN = mockChildren(100);
const RISK_COLOR: any = { Low:"#14b8a6", Medium:"#f59e0b", High:"#ef4444" };
const PER = 15;

export default function RecordsPage() {
  const [search, setSearch] = useState("");
  const [riskF, setRiskF] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => CHILDREN.filter((c: any) =>
    (riskF === "All" || c.risk_level === riskF) &&
    (!search || c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.child_id.toLowerCase().includes(search.toLowerCase()) ||
      c.district.toLowerCase().includes(search.toLowerCase()))
  ), [search, riskF]);

  const pages = Math.ceil(filtered.length / PER);
  const rows = filtered.slice((page-1)*PER, page*PER);

  function exportCSV() {
    const csv = ["ID,Name,Age,Gender,District,Weight,BMI,Risk,Scheme",
      ...filtered.map((c: any) => `${c.child_id},${c.name},${c.age_months}m,${c.gender},${c.district},${c.weight_kg}kg,${c.bmi},${c.risk_level},${c.scheme_enrolled?"Yes":"No"}`)
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type:"text/csv" }));
    a.download = "cnit_records.csv"; a.click();
  }

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:"white" }}>Child Health Records</h1>
          <p style={{ fontSize:13, color:"#94a3b8", marginTop:4 }}>{filtered.length} records found</p>
        </div>
        <button onClick={exportCSV} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 18px", borderRadius:12, border:"1px solid rgba(20,184,166,0.2)", background:"rgba(20,184,166,0.1)", color:"#14b8a6", cursor:"pointer", fontSize:13, fontWeight:500 }}>
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="glass" style={{ borderRadius:16, padding:16, marginBottom:16, display:"flex", gap:12 }}>
        <div style={{ position:"relative", flex:1 }}>
          <Search size={16} color="#64748b" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, ID, or district..."
            className="input-field" style={{ width:"100%", padding:"10px 12px 10px 38px", borderRadius:10, fontSize:13 }} />
        </div>
        <select value={riskF} onChange={e => { setRiskF(e.target.value); setPage(1); }}
          className="input-field" style={{ padding:"10px 16px", borderRadius:10, fontSize:13, cursor:"pointer" }}>
          <option value="All">All Risk Levels</option>
          <option value="Low">Low Risk</option>
          <option value="Medium">Medium Risk</option>
          <option value="High">High Risk</option>
        </select>
      </div>

      <div className="glass" style={{ borderRadius:16, overflow:"hidden" }}>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", fontSize:13, borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid rgba(148,163,184,0.08)", background:"rgba(15,23,42,0.5)" }}>
                {["ID","Name","Age","Gender","District","Weight","BMI","Risk","Scheme"].map(h => (
                  <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#64748b", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c: any) => (
                <tr key={c.id} className="table-row-hover" style={{ borderBottom:"1px solid rgba(148,163,184,0.05)" }}>
                  <td style={{ padding:"12px 16px", fontFamily:"monospace", fontSize:11, color:"#64748b" }}>{c.child_id}</td>
                  <td style={{ padding:"12px 16px", fontWeight:500, color:"white", whiteSpace:"nowrap" }}>{c.name}</td>
                  <td style={{ padding:"12px 16px", color:"#cbd5e1" }}>{c.age_months}m</td>
                  <td style={{ padding:"12px 16px", color:"#cbd5e1" }}>{c.gender}</td>
                  <td style={{ padding:"12px 16px", color:"#cbd5e1", whiteSpace:"nowrap" }}>{c.district}</td>
                  <td style={{ padding:"12px 16px", color:"#cbd5e1" }}>{c.weight_kg} kg</td>
                  <td style={{ padding:"12px 16px", color:"#cbd5e1" }}>{c.bmi}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <span style={{ padding:"3px 10px", borderRadius:999, fontSize:11, fontWeight:600, color:RISK_COLOR[c.risk_level], background:`${RISK_COLOR[c.risk_level]}20` }}>{c.risk_level}</span>
                  </td>
                  <td style={{ padding:"12px 16px", fontSize:12, fontWeight:500, color: c.scheme_enrolled ? "#34d399" : "#64748b" }}>
                    {c.scheme_enrolled ? "Enrolled" : "Not enrolled"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", borderTop:"1px solid rgba(148,163,184,0.08)" }}>
          <span style={{ fontSize:12, color:"#64748b" }}>
            {Math.min((page-1)*PER+1, filtered.length)}–{Math.min(page*PER, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display:"flex", gap:4 }}>
            <button disabled={page===1} onClick={() => setPage(p=>p-1)}
              style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"rgba(30,41,59,0.8)", color:"#94a3b8", cursor:page===1?"not-allowed":"pointer", opacity:page===1?0.4:1, fontSize:12 }}>Prev</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const p = Math.max(1, Math.min(page-2, pages-4)) + i;
              return <button key={p} onClick={() => setPage(p)}
                style={{ width:32, height:32, borderRadius:8, border:"none", cursor:"pointer", fontSize:12,
                  background: p===page ? "linear-gradient(135deg,#0d9488,#14b8a6)" : "rgba(30,41,59,0.8)",
                  color: p===page ? "white" : "#94a3b8" }}>{p}</button>;
            })}
            <button disabled={page===pages} onClick={() => setPage(p=>p+1)}
              style={{ padding:"6px 14px", borderRadius:8, border:"none", background:"rgba(30,41,59,0.8)", color:"#94a3b8", cursor:page===pages?"not-allowed":"pointer", opacity:page===pages?0.4:1, fontSize:12 }}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
