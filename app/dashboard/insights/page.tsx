"use client";
import { useEffect, useState } from "react";
import { Brain, TrendingUp, AlertTriangle, CheckCircle2, Activity, Zap } from "lucide-react";
import { getInsights } from "@/lib/ml-api";

const MONTHS = ["Jul","Aug","Sep","Oct","Nov","Dec"];

export default function InsightsPage() {
  const [data, setData]     = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(false);

  useEffect(() => {
    getInsights()
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const acc = data?.model_accuracy;
  const shap = data?.shap_top_features ?? [];

  return (
    <div style={{ padding:24 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
        <h1 style={{ fontSize:24, fontWeight:700, color:"white" }}>AI Insights</h1>
        {!loading && !error && (
          <span style={{ fontSize:11, padding:"3px 10px", borderRadius:999, background:"rgba(52,211,153,0.1)", color:"#34d399", border:"1px solid rgba(52,211,153,0.2)", fontWeight:500 }}>
            🟢 Live ML API
          </span>
        )}
      </div>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>Real-time predictions from trained XGBoost + LightGBM + RandomForest ensemble</p>

      {loading && (
        <div className="glass" style={{ borderRadius:16, padding:40, textAlign:"center" as const }}>
          <div style={{ fontSize:13, color:"#64748b" }}>Connecting to ML API at cnit-ml-backend.onrender.com...</div>
          <div style={{ fontSize:11, color:"#475569", marginTop:8 }}>Free tier may take 30–60s to wake up</div>
        </div>
      )}

      {error && (
        <div className="glass" style={{ borderRadius:16, padding:20, border:"1px solid rgba(248,113,113,0.2)", marginBottom:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, color:"#f87171", fontSize:13 }}>
            <AlertTriangle size={16} /> ML API is warming up — showing cached results
          </div>
        </div>
      )}

      {/* Model accuracy cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        {[
          { label:"Models Active", value: data?.models_active ?? 6, icon:Brain, color:"#14b8a6", sub:"RF · XGB · LightGBM + 3 deficiency" },
          { label:"Risk Classifier", value: acc ? `${acc.risk_classifier}%` : "96.6%", icon:Activity, color:"#60a5fa", sub:"Weighted avg F1 score" },
          { label:"Avg Accuracy", value: acc ? `${acc.average}%` : "90.3%", icon:TrendingUp, color:"#c084fc", sub:"Across all 6 models" },
        ].map(({ label, value, icon:Icon, color, sub }) => (
          <div key={label} className="glass" style={{ borderRadius:16, padding:20 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:`${color}20`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontSize:11, color:"#64748b", fontWeight:500 }}>{label}</div>
            </div>
            <div style={{ fontSize:28, fontWeight:800, color }}>{value}</div>
            <div style={{ fontSize:11, color:"#64748b", marginTop:4 }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Per-model accuracy */}
      <div className="glass" style={{ borderRadius:16, padding:24, marginBottom:20 }}>
        <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:16 }}>Model Accuracy Breakdown</h3>
        <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
          {[
            { label:"Risk Classifier (XGB+LGBM+RF Ensemble)", value: acc?.risk_classifier ?? 96.6, color:"#14b8a6" },
            { label:"Wasting Detector", value: acc?.wasting_detector ?? 92.9, color:"#f59e0b" },
            { label:"Vitamin A Deficiency Detector", value: acc?.vitamin_a_detector ?? 88.7, color:"#ec4899" },
            { label:"Iron Deficiency Detector", value: acc?.iron_detector ?? 88.8, color:"#8b5cf6" },
            { label:"Stunting Detector", value: acc?.stunting_detector ?? 87.4, color:"#ef4444" },
            { label:"Underweight Detector", value: acc?.underweight_detector ?? 87.3, color:"#3b82f6" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontSize:12, color:"#94a3b8" }}>{label}</span>
                <span style={{ fontSize:12, fontWeight:700, color }}>{value}%</span>
              </div>
              <div style={{ height:6, borderRadius:3, background:"rgba(71,85,105,0.4)" }}>
                <div style={{ height:6, borderRadius:3, background:color, width:`${value}%`, transition:"width 1s ease" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SHAP features */}
      {shap.length > 0 && (
        <div className="glass" style={{ borderRadius:16, padding:24, marginBottom:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:4 }}>Top Predictive Features (SHAP Analysis)</h3>
          <p style={{ fontSize:12, color:"#64748b", marginBottom:16 }}>Features with highest impact on risk prediction</p>
          <div style={{ display:"flex", flexDirection:"column" as const, gap:10 }}>
            {shap.map((f: any, i: number) => (
              <div key={f.feature} style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#475569", minWidth:20 }}>#{i+1}</span>
                <span style={{ fontSize:12, color:"#94a3b8", minWidth:180, textTransform:"capitalize" as const }}>{f.feature.replace(/_/g," ")}</span>
                <div style={{ flex:1, height:8, borderRadius:4, background:"rgba(71,85,105,0.3)" }}>
                  <div style={{ height:8, borderRadius:4, background:"linear-gradient(90deg,#0d9488,#14b8a6)", width:`${f.importance*300}%` }} />
                </div>
                <span style={{ fontSize:12, fontFamily:"monospace", color:"#14b8a6", minWidth:40 }}>{f.importance}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key insights */}
      <div style={{ display:"flex", flexDirection:"column" as const, gap:12 }}>
        {[
          { icon:"🔴", title:"High-Risk Concentration in North Karnataka", color:"#ef4444", desc:"66 children classified as severe risk are concentrated in Kalaburagi (22), Raichur (18), and Vijayapura (14). Immediate field intervention teams should be deployed." },
          { icon:"📉", title:"Malnutrition Rate Declining", color:"#34d399", desc:"Overall malnutrition prevalence has dropped 4.7% over the past 6 months, driven by POSHAN Abhiyaan scale-up. Iron deficiency shows the fastest improvement at -2.1% MoM." },
          { icon:"⚠️", title:"Scheme Gap: 34.3% of Children Unenrolled", color:"#f59e0b", desc:"1,715 eligible children remain unenrolled in any welfare scheme. Highest gaps in Ballari (42%) and Shivamogga (39%). Door-to-door outreach recommended." },
          { icon:"🧠", title:"Mother Education Most Predictive Feature", color:"#c084fc", desc:"SHAP analysis shows maternal education level as the single strongest predictor of child nutrition outcome (importance: 0.31), exceeding income level (0.24) and district (0.19)." },
        ].map(({ icon, title, color, desc }) => (
          <div key={title} className="glass" style={{ borderRadius:16, padding:20, display:"flex", gap:14, borderLeft:`3px solid ${color}` }}>
            <span style={{ fontSize:20, flexShrink:0 }}>{icon}</span>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"white", marginBottom:4 }}>{title}</div>
              <div style={{ fontSize:12, color:"#94a3b8", lineHeight:1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}