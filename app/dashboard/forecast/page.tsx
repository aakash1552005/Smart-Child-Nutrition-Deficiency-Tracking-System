"use client";
import { FORECAST } from "@/lib/mock-data";
import { TrendingDown, Calendar } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const TT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", border:"1px solid rgba(148,163,184,0.1)", borderRadius:8, padding:"8px 12px", fontSize:12 }}>
      <div style={{ color:"white", fontWeight:600, marginBottom:4 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:p.color }} />
          <span style={{ color:"#94a3b8" }}>{p.name}:</span>
          <span style={{ color:"white" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function ForecastPage() {
  const lastHigh = FORECAST[FORECAST.length-1].high;
  const firstHigh = FORECAST[0].high;
  const reduction = Math.round(((firstHigh-lastHigh)/firstHigh)*100);

  return (
    <div style={{ padding:24 }}>
      <h1 style={{ fontSize:24, fontWeight:700, color:"white", marginBottom:4 }}>Forecasting</h1>
      <p style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>6-month ahead nutrition risk projection using Prophet & ML models</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:24 }}>
        {[
          { label:"Projected High Risk (Month 6)", value:String(lastHigh), color:"#34d399", sub:`${reduction}% reduction projected` },
          { label:"Model", value:"Prophet", color:"#60a5fa", sub:"Seasonal decomposition + trend" },
          { label:"Confidence Level", value:"89%", color:"#c084fc", sub:"Based on validation data" },
        ].map(({ label, value, color, sub }) => (
          <div key={label} className="glass" style={{ borderRadius:16, padding:20 }}>
            <div style={{ fontSize:28, fontWeight:700, color }}>{value}</div>
            <div style={{ fontSize:13, fontWeight:600, color:"white", marginTop:4 }}>{label}</div>
            <div style={{ fontSize:11, color:"#64748b", marginTop:2 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="glass" style={{ borderRadius:16, padding:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"white" }}>Risk Trend Forecast</h3>
          <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#64748b" }}>
            <Calendar size={14} />Next 6 months
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={FORECAST} margin={{ top:5, right:20, bottom:5, left:0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.06)" />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:"#94a3b8" }} />
            <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} />
            <Tooltip content={<TT />} />
            <Legend wrapperStyle={{ fontSize:11, color:"#94a3b8" }} />
            <ReferenceLine y={50} stroke="rgba(239,68,68,0.3)" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="high" name="High Risk" stroke="#ef4444" strokeWidth={2.5} dot={{ r:4, fill:"#ef4444" }} activeDot={{ r:6 }} />
            <Line type="monotone" dataKey="medium" name="Medium Risk" stroke="#f59e0b" strokeWidth={2.5} dot={{ r:4, fill:"#f59e0b" }} activeDot={{ r:6 }} />
          </LineChart>
        </ResponsiveContainer>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:16 }}>
          <TrendingDown size={14} color="#34d399" />
          <p style={{ fontSize:12, color:"#94a3b8" }}>
            With continued POSHAN Abhiyaan scale-up, high-risk cases projected to drop from <strong style={{ color:"#f87171" }}>{firstHigh}</strong> to <strong style={{ color:"#34d399" }}>{lastHigh}</strong> ({reduction}% reduction) over 6 months.
          </p>
        </div>
      </div>
    </div>
  );
}
