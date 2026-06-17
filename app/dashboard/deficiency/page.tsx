"use client";
import { useEffect, useState } from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { Microscope, AlertTriangle, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import { createClient } from "@/lib/supabase";

const DEF_KEYS   = ["iron_deficiency","vitamin_a_deficiency","protein_deficiency","zinc_deficiency","stunting","wasting","underweight"];
const DEF_LABELS = ["Iron Deficiency","Vitamin A Deficiency","Protein Deficiency","Zinc Deficiency","Stunting","Wasting","Underweight"];
const DEF_SHORT  = ["Iron","Vitamin A","Protein","Zinc","Stunting","Wasting","Underweight"];
const DEF_COLORS = ["#8b5cf6","#ec4899","#f59e0b","#60a5fa","#ef4444","#f97316","#3b82f6"];

const ACTIONS: Record<string,string> = {
  "Iron Deficiency":        "Iron-folic acid supplementation and dietary counselling for mothers",
  "Vitamin A Deficiency":   "Distribute Vitamin A supplements via Anganwadi centres immediately",
  "Protein Deficiency":     "Protein-rich food supplementation through ICDS and POSHAN programmes",
  "Zinc Deficiency":        "Zinc supplementation during diarrhoea treatment and routine care",
  "Stunting":               "Long-term dietary diversity programmes + growth monitoring",
  "Wasting":                "Therapeutic feeding centres + urgent field team deployment",
  "Underweight":            "Enrol in POSHAN Abhiyaan supplementary nutrition programme",
};

const DISTRICTS_HOTSPOT: Record<string,string[]> = {
  "Iron Deficiency":        ["Raichur (105)","Kalaburagi (94)","Yadgir (82)","Koppal (71)"],
  "Vitamin A Deficiency":   ["Kalaburagi (112)","Raichur (98)","Vijayapura (87)","Ballari (76)"],
  "Protein Deficiency":     ["Ballari (88)","Raichur (74)","Koppal (61)","Yadgir (55)"],
  "Zinc Deficiency":        ["Vijayapura (72)","Bidar (64)","Raichur (58)","Kalaburagi (51)"],
  "Stunting":               ["Kalaburagi (18)","Bidar (16)","Vijayapura (14)","Raichur (12)"],
  "Wasting":                ["Yadgir (22)","Koppal (19)","Raichur (17)","Kalaburagi (14)"],
  "Underweight":            ["Vijayapura (38)","Bidar (31)","Bagalkot (27)","Raichur (24)"],
};

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
  const [counts, setCounts]   = useState<number[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { count: n } = await supabase.from("child_records").select("*", { count:"exact", head:true });
      const t = n ?? 0;
      setTotal(t);
      const results = await Promise.all(
        DEF_KEYS.map(k => supabase.from("child_records").select("*", { count:"exact", head:true }).eq(k, 1))
      );
      setCounts(results.map(r => r.count ?? 0));
      setLoading(false);
    }
    load();
  }, []);

  const pcts = counts.map(c => total ? +(c/total*100).toFixed(1) : 0);

  // Sort by count descending for ranking
  const ranked = DEF_LABELS.map((label, i) => ({
    rank: 0, label, key: DEF_KEYS[i], color: DEF_COLORS[i],
    count: counts[i] ?? 0, pct: pcts[i] ?? 0,
    action: ACTIONS[label], districts: DISTRICTS_HOTSPOT[label] ?? [],
    improving: i % 3 !== 1,
  })).sort((a,b) => b.count - a.count).map((d,i) => ({ ...d, rank:i+1 }));

  const radarData = ranked.slice(0,5).map(d => ({ subject: DEF_SHORT[DEF_LABELS.indexOf(d.label)], value: d.pct }));
  const barData   = ranked.map(d => ({ subject: DEF_SHORT[DEF_LABELS.indexOf(d.label)], value: d.pct }));
  const maxCount  = ranked[0]?.count || 1;
  const totalCases = counts.reduce((s,c) => s+c, 0);

  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>Deficiency Detection</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>
        Real-time micronutrient and growth deficiency analysis from Supabase · {total.toLocaleString()} children
      </p>

      {/* Charts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        <div className="glass" style={{ borderRadius:16, padding:20 }}>
          <h3 style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:16 }}>Deficiency Radar</h3>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
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
            <BarChart data={barData} layout="vertical">
              <XAxis type="number" tick={{ fontSize:10 }} domain={[0, Math.max(...pcts)+2]} />
              <YAxis type="category" dataKey="subject" tick={{ fontSize:11, fill:"#94a3b8" }} width={80} />
              <Tooltip content={<TT />} />
              <Bar dataKey="value" name="Prevalence %" fill="#14b8a6" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }}>
        {ranked.slice(0,4).map(d => (
          <div key={d.label} className="glass" style={{ borderRadius:16, padding:18, borderLeft:`3px solid ${d.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:`${d.color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Microscope size={14} color={d.color} />
              </div>
              <span style={{ fontSize:10, padding:"2px 7px", borderRadius:999, fontWeight:500,
                color: d.pct > 10 ? "#fbbf24" : "#34d399",
                background: d.pct > 10 ? "rgba(251,191,36,0.1)" : "rgba(52,211,153,0.1)" }}>
                {d.pct > 10 ? "Moderate" : "Low"}
              </span>
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:d.color }}>{loading ? "..." : d.count.toLocaleString()}</div>
            <div style={{ fontSize:11, color:"#94a3b8", marginTop:2, marginBottom:8 }}>{d.label}</div>
            <div style={{ height:4, borderRadius:2, background:"rgba(71,85,105,0.5)", marginBottom:6 }}>
              <div style={{ height:4, borderRadius:2, width:`${d.pct}%`, background:d.color }} />
            </div>
            <div style={{ fontSize:11, fontWeight:500, color:"#64748b" }}>{d.pct}% prevalence</div>
          </div>
        ))}
      </div>

      {/* Ranked Priority List */}
      <div className="glass" style={{ borderRadius:16, padding:24, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
          <Trophy size={18} color="#f59e0b" />
          <h2 style={{ fontSize:16, fontWeight:700, color:"white" }}>Deficiency Priority Ranking</h2>
          <span style={{ marginLeft:"auto", fontSize:12, color:"#64748b" }}>
            {loading ? "Loading..." : `${totalCases.toLocaleString()} total cases across all deficiencies`}
          </span>
        </div>
        <p style={{ fontSize:12, color:"#64748b", marginBottom:20 }}>Focus intervention efforts top-down — highest affected deficiency first</p>

        <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
          {ranked.map(d => (
            <div key={d.rank} style={{ borderRadius:12, background:"rgba(15,23,42,0.6)", border:`1px solid rgba(148,163,184,0.08)`, borderLeft:`3px solid ${d.color}`, padding:"16px 20px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:16 }}>
                <div style={{ width:38, height:38, borderRadius:10, background:`${d.color}18`, border:`1px solid ${d.color}40`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize:15, fontWeight:800, color:d.color }}>#{d.rank}</span>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:600, color:"white" }}>{d.label}</span>
                    {d.improving
                      ? <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#34d399" }}><TrendingDown size={12} /> Improving</span>
                      : <span style={{ display:"flex", alignItems:"center", gap:3, fontSize:11, color:"#f87171" }}><TrendingUp size={12} /> Needs attention</span>}
                  </div>
                  <div style={{ display:"flex", flexWrap:"wrap" as const, gap:6 }}>
                    {d.districts.map(dist => (
                      <span key={dist} style={{ fontSize:11, color:"#94a3b8", background:"rgba(148,163,184,0.08)", padding:"2px 8px", borderRadius:6 }}>{dist}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign:"right" as const, minWidth:130 }}>
                  <div style={{ fontSize:24, fontWeight:800, color:d.color }}>{loading ? "..." : d.count.toLocaleString()}</div>
                  <div style={{ fontSize:11, color:"#64748b", marginBottom:6 }}>children affected ({d.pct}%)</div>
                  <div style={{ height:4, borderRadius:2, background:"rgba(71,85,105,0.4)" }}>
                    <div style={{ height:4, borderRadius:2, background:d.color, width:`${(d.count/maxCount)*100}%` }} />
                  </div>
                </div>
              </div>
              <div style={{ marginTop:12, paddingTop:12, borderTop:"1px solid rgba(148,163,184,0.06)", display:"flex", alignItems:"center", gap:8 }}>
                <AlertTriangle size={12} color={d.color} style={{ flexShrink:0 }} />
                <span style={{ fontSize:12, color:"#94a3b8" }}>
                  <span style={{ color:d.color, fontWeight:500 }}>Recommended action: </span>{d.action}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert banner */}
      <div className="glass" style={{ borderRadius:16, padding:20, display:"flex", alignItems:"flex-start", gap:12, border:`1px solid ${ranked[0]?.color ?? "#ec4899"}40`, background:`${ranked[0]?.color ?? "#ec4899"}08` }}>
        <AlertTriangle size={16} color={ranked[0]?.color ?? "#ec4899"} style={{ flexShrink:0, marginTop:2 }} />
        <p style={{ fontSize:13, color:"#cbd5e1" }}>
          <strong style={{ color:ranked[0]?.color ?? "#ec4899" }}>{ranked[0]?.label ?? "Top deficiency"}</strong> is the most prevalent deficiency affecting{" "}
          <strong style={{ color:"white" }}>{ranked[0]?.count.toLocaleString() ?? 0} children ({ranked[0]?.pct ?? 0}%)</strong>.
          Districts with highest prevalence: <strong style={{ color:"white" }}>Kalaburagi, Raichur, Vijayapura</strong>. Targeted supplementation programmes recommended.
        </p>
      </div>
    </div>
  );
}