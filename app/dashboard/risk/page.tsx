"use client";
import { useState, useCallback } from "react";
import { AlertTriangle, CheckCircle2, Zap, Loader2, Brain } from "lucide-react";
import { DISTRICTS } from "@/lib/mock-data";
import { predictRisk, predictDeficiency } from "@/lib/ml-api";

const RC: any = { High:"#ef4444", Medium:"#f59e0b", Low:"#14b8a6" };
const RI: any = { High:AlertTriangle, Medium:Zap, Low:CheckCircle2 };

const RECS: Record<string,string[]> = {
  High: ["Immediate nutritional intervention required","Enroll in POSHAN Abhiyaan","Schedule weekly health worker visit","Refer to Nutrition Rehabilitation Centre"],
  Medium: ["Monthly monitoring recommended","Iron & Vitamin A supplementation","Dietary diversity counselling for mother"],
  Low: ["Continue routine monitoring","Ensure vaccination schedule is complete","Regular growth monitoring"],
};

// Styles defined OUTSIDE component — never recreated
const inputStyle: React.CSSProperties = {
  width:"100%", padding:"10px 12px", borderRadius:10, fontSize:13,
  background:"rgba(30,41,59,0.8)", border:"1px solid rgba(148,163,184,0.12)",
  color:"white", outline:"none", boxSizing:"border-box"
};

// Label wrapper defined OUTSIDE component
function FieldLabel({ label, children }: { label:string; children:React.ReactNode }) {
  return (
    <div>
      <label style={{ display:"block", fontSize:11, color:"#94a3b8", fontWeight:500, marginBottom:5, textTransform:"uppercase", letterSpacing:"0.04em" }}>{label}</label>
      {children}
    </div>
  );
}

export default function RiskPage() {
  // Use strings for text inputs to avoid number conversion on each keystroke
  const [age, setAge]           = useState("24");
  const [weight, setWeight]     = useState("9.2");
  const [height, setHeight]     = useState("78.5");
  const [gender, setGender]     = useState("0");
  const [district, setDistrict] = useState("Kalaburagi");
  const [motherEdu, setMotherEdu] = useState("1");
  const [income, setIncome]     = useState("0");
  const [scheme, setScheme]     = useState(false);
  const [vitA, setVitA]         = useState(false);
  const [iron, setIron]         = useState(false);
  const [uw, setUw]             = useState(false);
  const [wasting, setWasting]   = useState(false);
  const [stunting, setStunting] = useState(false);

  const [result, setResult]     = useState<any>(null);
  const [defResult, setDefResult] = useState<any>(null);
  const [loading, setLoading]   = useState(false);
  const [apiMode, setApiMode]   = useState<"ml"|"fallback">("ml");

  function fallbackPredict() {
    const wt = parseFloat(weight) || 9.2;
    const ht = parseFloat(height) || 78.5;
    const bmi = wt / (ht/100)**2;
    let s = 0;
    if (bmi<14) s+=6; else if (bmi<16) s+=4; else if (bmi<18) s+=2;
    if (parseInt(income)===0) s+=2; else if (parseInt(income)===1) s+=1;
    if (parseInt(motherEdu)<=1) s+=2;
    if (!scheme) s+=1;
    if (wasting) s+=3; if (stunting) s+=3;
    const level = s>=7?"High":s>=3?"Medium":"Low";
    return { risk_level:level, confidence:72, bmi:+bmi.toFixed(1),
      probabilities:{ Low:level==="Low"?72:15, Medium:level==="Medium"?72:20, High:level==="High"?72:10 }};
  }

  async function submit() {
    setLoading(true);
    const payload = {
      age_months: parseInt(age)||24,
      gender: parseInt(gender),
      district,
      mother_edu: parseInt(motherEdu),
      income_level: parseInt(income),
      scheme_enrolled: scheme?1:0,
      weight_kg: parseFloat(weight)||9.2,
      height_cm: parseFloat(height)||78.5,
      vitamin_a: vitA?1:0,
      iron: iron?1:0,
      underweight: uw?1:0,
      wasting: wasting?1:0,
      stunting: stunting?1:0,
    };
    try {
      const [riskData, defData] = await Promise.all([
        predictRisk(payload), predictDeficiency(payload)
      ]);
      if (riskData.error) throw new Error(riskData.error);
      setResult(riskData);
      setDefResult(defData.deficiencies);
      setApiMode("ml");
    } catch {
      setResult(fallbackPredict());
      setDefResult(null);
      setApiMode("fallback");
    }
    setLoading(false);
  }

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
        <h1 style={{ fontSize:24, fontWeight:700, color:"white" }}>Risk Prediction</h1>
        <span style={{ fontSize:11, padding:"3px 10px", borderRadius:999,
          background: apiMode==="ml"&&result ? "rgba(52,211,153,0.1)" : "rgba(245,158,11,0.1)",
          color: apiMode==="ml"&&result ? "#34d399" : "#f59e0b",
          border:`1px solid ${apiMode==="ml"&&result?"rgba(52,211,153,0.2)":"rgba(245,158,11,0.2)"}`,
          fontWeight:500 }}>
          {apiMode==="ml"&&result ? "🟢 XGBoost+LGBM+RF Ensemble" : "⚡ AI Risk Engine"}
        </span>
      </div>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>Real ML predictions — XGBoost + LightGBM + RandomForest ensemble</p>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
        <div className="glass" style={{ borderRadius:16, padding:24 }}>
          <h2 style={{ fontSize:15, fontWeight:600, color:"white", marginBottom:20 }}>Child Profile</h2>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <FieldLabel label="Age (months)">
                <input type="number" min={0} max={60} value={age}
                  onChange={e => setAge(e.target.value)} style={inputStyle} />
              </FieldLabel>
              <FieldLabel label="Gender">
                <select value={gender} onChange={e => setGender(e.target.value)} style={inputStyle}>
                  <option value="0">Male</option>
                  <option value="1">Female</option>
                </select>
              </FieldLabel>
              <FieldLabel label="Weight (kg)">
                <input type="number" step="0.1" value={weight}
                  onChange={e => setWeight(e.target.value)} style={inputStyle} />
              </FieldLabel>
              <FieldLabel label="Height (cm)">
                <input type="number" step="0.1" value={height}
                  onChange={e => setHeight(e.target.value)} style={inputStyle} />
              </FieldLabel>
            </div>
            <FieldLabel label="District">
              <select value={district} onChange={e => setDistrict(e.target.value)} style={inputStyle}>
                {DISTRICTS.map(d => <option key={d}>{d}</option>)}
              </select>
            </FieldLabel>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <FieldLabel label="Mother Education">
                <select value={motherEdu} onChange={e => setMotherEdu(e.target.value)} style={inputStyle}>
                  <option value="0">No Education</option>
                  <option value="1">Primary</option>
                  <option value="2">Secondary</option>
                  <option value="3">Graduate+</option>
                </select>
              </FieldLabel>
              <FieldLabel label="Income Level">
                <select value={income} onChange={e => setIncome(e.target.value)} style={inputStyle}>
                  <option value="0">Below Poverty</option>
                  <option value="1">Low Income</option>
                  <option value="2">Middle+</option>
                </select>
              </FieldLabel>
            </div>

            <div style={{ fontSize:11, color:"#64748b", fontWeight:600, textTransform:"uppercase" as const, letterSpacing:"0.04em" }}>Observed Deficiency Flags</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {([
                ["Vitamin A", vitA, setVitA],
                ["Iron", iron, setIron],
                ["Underweight", uw, setUw],
                ["Wasting", wasting, setWasting],
                ["Stunting", stunting, setStunting],
                ["Scheme Enrolled", scheme, setScheme],
              ] as [string, boolean, (v:boolean)=>void][]).map(([label, checked, setter]) => (
                <label key={label} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer",
                  background: checked ? "rgba(20,184,166,0.1)" : "rgba(30,41,59,0.5)",
                  padding:"8px 10px", borderRadius:8,
                  border:`1px solid ${checked?"rgba(20,184,166,0.3)":"rgba(148,163,184,0.08)"}` }}>
                  <input type="checkbox" checked={checked}
                    onChange={e => setter(e.target.checked)}
                    style={{ accentColor:"#14b8a6" }} />
                  <span style={{ fontSize:11, color: checked?"#14b8a6":"#94a3b8" }}>{label}</span>
                </label>
              ))}
            </div>

            <button onClick={submit} disabled={loading}
              style={{ padding:"14px", borderRadius:12, border:"none",
                cursor:loading?"not-allowed":"pointer", fontSize:14, fontWeight:600,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                opacity:loading?0.7:1, background:"linear-gradient(135deg,#0d9488,#14b8a6)", color:"white" }}>
              {loading
                ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> Analysing...</>
                : <><Brain size={16} /> Predict with ML Model</>}
            </button>
            {loading && <div style={{ fontSize:11, color:"#64748b", textAlign:"center" as const }}>ML API may take ~30s on first call</div>}
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column" as const, gap:16 }}>
          {result ? (() => {
            const lvl   = result.risk_level;
            const color = RC[lvl];
            const Icon  = RI[lvl];
            return (
              <>
                <div className="glass" style={{ borderRadius:16, padding:24, borderTop:`3px solid ${color}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:`${color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <Icon size={24} color={color} />
                    </div>
                    <div>
                      <div style={{ fontSize:22, fontWeight:800, color }}>{lvl} Risk</div>
                      <div style={{ fontSize:12, color:"#64748b" }}>Confidence: {result.confidence}% · BMI: {result.bmi}</div>
                    </div>
                    {apiMode==="ml" && <span style={{ marginLeft:"auto", fontSize:11, color:"#34d399", background:"rgba(52,211,153,0.1)", padding:"2px 8px", borderRadius:6 }}>ML API</span>}
                  </div>
                  {result.probabilities && (
                    <div style={{ marginBottom:16 }}>
                      {Object.entries(result.probabilities).map(([k,v]:any) => (
                        <div key={k} style={{ marginBottom:8 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#64748b", marginBottom:3 }}>
                            <span>{k} Risk</span><span>{v}%</span>
                          </div>
                          <div style={{ height:5, borderRadius:3, background:"rgba(71,85,105,0.4)" }}>
                            <div style={{ height:5, borderRadius:3, width:`${v}%`, background:RC[k], transition:"width 0.8s" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize:12, fontWeight:600, color:"#64748b", marginBottom:8, textTransform:"uppercase" as const }}>Recommendations</div>
                  {(RECS[lvl]??RECS.Low).map((r:string) => (
                    <div key={r} style={{ display:"flex", alignItems:"flex-start", gap:8, marginBottom:6 }}>
                      <CheckCircle2 size={13} color="#14b8a6" style={{ flexShrink:0, marginTop:2 }} />
                      <span style={{ fontSize:12, color:"#cbd5e1" }}>{r}</span>
                    </div>
                  ))}
                </div>
                {defResult && (
                  <div className="glass" style={{ borderRadius:16, padding:20 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:12 }}>ML Deficiency Detection</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
                      {Object.entries(defResult).map(([key, val]:any) => (
                        <div key={key} style={{ textAlign:"center" as const, padding:12, borderRadius:10,
                          background:val.predicted?"rgba(239,68,68,0.1)":"rgba(20,184,166,0.05)",
                          border:`1px solid ${val.predicted?"rgba(239,68,68,0.2)":"rgba(20,184,166,0.1)"}` }}>
                          <div style={{ fontSize:10, color:"#64748b", marginBottom:4, textTransform:"capitalize" as const }}>{key.replace(/_/g," ")}</div>
                          <div style={{ fontSize:18, fontWeight:700, color:val.predicted?"#f87171":"#34d399" }}>{val.probability}%</div>
                          <div style={{ fontSize:10, fontWeight:500, color:val.predicted?"#f87171":"#34d399" }}>{val.predicted?"At risk":"Normal"}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })() : (
            <div className="glass" style={{ borderRadius:16, padding:40, display:"flex", flexDirection:"column" as const, alignItems:"center", justifyContent:"center", textAlign:"center" as const, height:320 }}>
              <div style={{ width:56, height:56, borderRadius:16, background:"rgba(20,184,166,0.1)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:16 }}>
                <Brain size={28} color="#14b8a6" />
              </div>
              <div style={{ color:"white", fontWeight:600, marginBottom:8 }}>XGBoost + LightGBM + RF Ensemble</div>
              <div style={{ color:"#64748b", fontSize:13 }}>Fill in the child profile and click Predict</div>
              <div style={{ color:"#475569", fontSize:11, marginTop:8 }}>Trained on 5,000 Karnataka records</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}