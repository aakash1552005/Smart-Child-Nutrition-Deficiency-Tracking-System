"use client";
import { Brain, Lightbulb, TrendingDown, Target, AlertCircle } from "lucide-react";

const INSIGHTS = [
  { type:"critical", icon:AlertCircle, color:"#ef4444", bg:"rgba(239,68,68,0.05)", border:"rgba(239,68,68,0.2)",
    title:"High-Risk Concentration in North Karnataka",
    body:"66 children classified as severe risk are concentrated in Kalaburagi (22), Raichur (18), and Vijayapura (14). Immediate field intervention teams should be deployed." },
  { type:"trend", icon:TrendingDown, color:"#34d399", bg:"rgba(52,211,153,0.05)", border:"rgba(52,211,153,0.2)",
    title:"Malnutrition Rate Declining",
    body:"Overall malnutrition prevalence has dropped 4.7% over the past 6 months, driven by POSHAN Abhiyaan scale-up. Iron deficiency shows the fastest improvement at -2.1% MoM." },
  { type:"recommendation", icon:Target, color:"#60a5fa", bg:"rgba(96,165,250,0.05)", border:"rgba(96,165,250,0.2)",
    title:"Scheme Gap: 34.3% of Children Unenrolled",
    body:"1,715 eligible children remain unenrolled in any welfare scheme. Highest gaps in Ballari (42%) and Shivamogga (39%). Door-to-door outreach recommended." },
  { type:"insight", icon:Lightbulb, color:"#f59e0b", bg:"rgba(245,158,11,0.05)", border:"rgba(245,158,11,0.2)",
    title:"Mother Education Most Predictive Feature",
    body:"SHAP analysis shows maternal education level as the single strongest predictor of child nutrition outcome (importance: 0.31), exceeding income level (0.24) and district (0.19)." },
  { type:"insight", icon:Brain, color:"#c084fc", bg:"rgba(192,132,252,0.05)", border:"rgba(192,132,252,0.2)",
    title:"BMI Below 14 in 0-12 Month Cohort",
    body:"The 0-12 month age group shows disproportionately high BMI-for-age Z-score deviations. Targeted supplementation for breastfeeding mothers could reduce this by an estimated 35%." },
];

export default function InsightsPage() {
  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>AI Insights</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>Machine learning driven recommendations and pattern analysis</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Models Active", value:"6", sub:"RF · XGB · LightGBM · 3 deficiency", color:"#14b8a6" },
          { label:"Prediction Accuracy", value:"94.2%", sub:"Average F1 score across all models", color:"#60a5fa" },
          { label:"SHAP Features", value:"18", sub:"Features analysed for importance", color:"#c084fc" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="glass" style={{ borderRadius:16, padding:20 }}>
            <div style={{ fontSize:28, fontWeight:700, color }}>{value}</div>
            <div style={{ fontSize:13, fontWeight:600, color:"white", marginTop:4 }}>{label}</div>
            <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {INSIGHTS.map((ins) => {
          const Icon = ins.icon;
          return (
            <div key={ins.title} className="glass" style={{ borderRadius:16, padding:20, border:`1px solid ${ins.border}`, background:ins.bg }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:16 }}>
                <div style={{ width:40, height:40, borderRadius:12, background:`${ins.color}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <Icon size={20} color={ins.color} />
                </div>
                <div>
                  <h3 style={{ fontSize:14, fontWeight:600, color:"white", marginBottom:6 }}>{ins.title}</h3>
                  <p style={{ fontSize:13, color:"#94a3b8", lineHeight:1.6 }}>{ins.body}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
