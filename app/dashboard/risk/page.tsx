"use client";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, Zap, Loader2 } from "lucide-react";
import { DISTRICTS } from "@/lib/mock-data";

const DEFAULT = { age_months:24, gender:"Female", height_cm:78.5, weight_kg:9.2, family_income:"Below Poverty", mother_education:"Primary", household_size:6, vaccination_status:"Partial", breastfeeding:"Yes", mid_day_meal:1, icds_enrolled:0, poshan_abhiyaan:1, district:"Kalaburagi" };
const RC: any = { High:"#ef4444", Medium:"#f59e0b", Low:"#14b8a6" };
const RI: any = { High:AlertTriangle, Medium:Zap, Low:CheckCircle2 };

function predict(f: any) {
  const bmi = f.weight_kg / (f.height_cm/100)**2;
  let s = 0;
  if (bmi<14) s+=6; else if (bmi<16) s+=4; else if (bmi<18) s+=2;
  if (f.family_income==="Below Poverty") s+=2; else if (f.family_income==="Low") s+=1;
  if (["No Education","Primary"].includes(f.mother_education)) s+=2;
  if (f.household_size>=7) s+=1;
  if (f.vaccination_status==="None") s+=2; else if (f.vaccination_status==="Partial") s+=1;
  if (f.breastfeeding==="No"&&f.age_months<12) s+=2;
  const label = s>=7?"High Risk":s>=3?"Medium Risk":"Low Risk";
  const score = Math.min(Math.round(s/12*100),100);
  const br = bmi<14?0.75:bmi<16?0.45:bmi<18?0.25:0.10;
  const recs = label==="High Risk"
    ? ["Immediate nutritional intervention required","Enroll in POSHAN Abhiyaan","Schedule weekly health worker visit","Refer to Nutrition Rehabilitation Centre"]
    : label==="Medium Risk"
    ? ["Monthly monitoring recommended","Iron & Vitamin A supplementation","Dietary diversity counselling"]
    : ["Continue routine monitoring","Ensure vaccination schedule is complete"];
  if (f.vaccination_status!=="Complete") recs.push("Complete pending vaccinations at nearest PHC");
  if (!f.icds_enrolled) recs.push("Enroll in ICDS programme");
  return { label, score, br, recs, iron: br+0.05, vitA: br+0.03, protein: Math.max(0,br-0.02) };
}

export default function RiskPage() {
  const [form, setForm] = useState(DEFAULT);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const upd = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  async function submit(e: any) {
    e.preventDefault(); setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setResult(predict(form)); setLoading(false);
  }

  const L = ({ label, children }: any) => (
    <div>
      <label style={{ display:"block", fontSize:12, color:"#94a3b8", fontWeight:500, marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
  const sel = { width:"100%", padding:"10px 12px", borderRadius:10, fontSize:13 };

  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>Risk Prediction</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>AI-powered malnutrition risk classification</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div className="glass" style={{ borderRadius:16, padding:24 }}>
          <h2 style={{ fontSize:16, fontWeight:600, color:"white", marginBottom:20 }}>Child Profile</h2>
          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <L label="Age (months)"><input type="number" min={0} max={60} value={form.age_months} onChange={e=>upd("age_months",+e.target.value)} className="input-field" style={sel} /></L>
              <L label="Gender"><select value={form.gender} onChange={e=>upd("gender",e.target.value)} className="input-field" style={sel}><option>Female</option><option>Male</option></select></L>
              <L label="Height (cm)"><input type="number" step="0.1" value={form.height_cm} onChange={e=>upd("height_cm",+e.target.value)} className="input-field" style={sel} /></L>
              <L label="Weight (kg)"><input type="number" step="0.1" value={form.weight_kg} onChange={e=>upd("weight_kg",+e.target.value)} className="input-field" style={sel} /></L>
            </div>
            <L label="District"><select value={form.district} onChange={e=>upd("district",e.target.value)} className="input-field" style={sel}>{DISTRICTS.map(d=><option key={d}>{d}</option>)}</select></L>
            <L label="Family Income"><select value={form.family_income} onChange={e=>upd("family_income",e.target.value)} className="input-field" style={sel}>{["Below Poverty","Low","Middle","High"].map(v=><option key={v}>{v}</option>)}</select></L>
            <L label="Mother Education"><select value={form.mother_education} onChange={e=>upd("mother_education",e.target.value)} className="input-field" style={sel}>{["No Education","Primary","Secondary","Graduate"].map(v=><option key={v}>{v}</option>)}</select></L>
            <L label="Household Size"><input type="number" min={1} max={20} value={form.household_size} onChange={e=>upd("household_size",+e.target.value)} className="input-field" style={sel} /></L>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <L label="Vaccination"><select value={form.vaccination_status} onChange={e=>upd("vaccination_status",e.target.value)} className="input-field" style={sel}>{["Complete","Partial","None"].map(v=><option key={v}>{v}</option>)}</select></L>
              <L label="Breastfeeding"><select value={form.breastfeeding} onChange={e=>upd("breastfeeding",e.target.value)} className="input-field" style={sel}><option>Yes</option><option>No</option></select></L>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
              {[["mid_day_meal","Mid-Day Meal"],["icds_enrolled","ICDS"],["poshan_abhiyaan","POSHAN"]].map(([k,l])=>(
                <label key={k} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                  <input type="checkbox" checked={!!form[k as keyof typeof form]} onChange={e=>upd(k,e.target.checked?1:0)} style={{ accentColor:"#14b8a6" }} />
                  <span style={{ fontSize:12, color:"#94a3b8" }}>{l}</span>
                </label>
              ))}
            </div>
            <button type="submit" disabled={loading} className="btn-primary"
              style={{ padding:"14px", borderRadius:12, border:"none", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:loading?0.7:1 }}>
              {loading && <Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} />}
              {loading ? "Analysing..." : "Predict Risk Level"}
            </button>
          </form>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {result ? (
            <>
              {(() => {
                const lvl = result.label.split(" ")[0];
                const color = RC[lvl];
                const Icon = RI[lvl];
                return (
                  <div className="glass" style={{ borderRadius:16, padding:24, borderTop:`3px solid ${color}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                      <div style={{ width:48, height:48, borderRadius:12, background:`${color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <Icon size={24} color={color} />
                      </div>
                      <div>
                        <div style={{ fontSize:20, fontWeight:700, color }}>{result.label}</div>
                        <div style={{ fontSize:12, color:"#94a3b8" }}>Risk Score: {result.score}/100</div>
                      </div>
                    </div>
                    <div style={{ marginBottom:20 }}>
                      <div style={{ height:10, borderRadius:5, background:"rgba(71,85,105,0.5)", overflow:"hidden" }}>
                        <div style={{ height:10, borderRadius:5, width:`${result.score}%`, background:`linear-gradient(90deg,${color}88,${color})`, transition:"width 0.7s" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:600, color:"#64748b", marginBottom:8, textTransform:"uppercase" }}>Recommendations</div>
                      {result.recs.map((r: string) => (
                        <div key={r} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}>
                          <CheckCircle2 size={14} color="#14b8a6" style={{ flexShrink:0, marginTop:2 }} />
                          <span style={{ fontSize:12, color:"#cbd5e1" }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              <div className="glass" style={{ borderRadius:16, padding:20 }}>
                <div style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:12 }}>Deficiency Prediction</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                  {[{ l:"Iron", p:result.iron, c:"#8b5cf6" },{ l:"Vitamin A", p:result.vitA, c:"#ec4899" },{ l:"Protein", p:result.protein, c:"#f59e0b" }].map(d => {
                    const at = d.p > 0.5;
                    return (
                      <div key={d.l} style={{ textAlign:"center", padding:12, borderRadius:10, background: at?`${d.c}15`:"rgba(30,41,59,0.5)" }}>
                        <div style={{ fontSize:11, color:"#94a3b8", marginBottom:4 }}>{d.l}</div>
                        <div style={{ fontSize:16, fontWeight:700, color: at?d.c:"#94a3b8" }}>{(d.p*100).toFixed(0)}%</div>
                        <div style={{ fontSize:11, fontWeight:500, color: at?"#f87171":"#34d399" }}>{at?"At risk":"Normal"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="glass" style={{ borderRadius:16, padding:40, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", height:320 }}>
              <div style={{ width:56, height:56, borderRadius:16, background:"rgba(20,184,166,0.1)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                <AlertTriangle size={28} color="#14b8a6" />
              </div>
              <div style={{ color:"white", fontWeight:600, marginBottom:8 }}>AI Risk Assessment</div>
              <div style={{ color:"#64748b", fontSize:13 }}>Fill in the child profile and click Predict Risk Level</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
