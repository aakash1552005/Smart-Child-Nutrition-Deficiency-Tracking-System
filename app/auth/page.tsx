"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Activity } from "lucide-react";

export default function AuthPage() {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: any) {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        setSuccess("Account created! Check your email, then sign in.");
        setMode("signin");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", background:"#0f172a" }}>
      {/* Left panel */}
      <div style={{ width:"45%", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"3rem", background:"linear-gradient(135deg,#042f2e,#0f172a)" }} className="hidden-mobile">
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"3rem" }}>
            <div style={{ width:40, height:40, borderRadius:10, background:"linear-gradient(135deg,#0d9488,#14b8a6)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Activity size={20} color="white" />
            </div>
            <div>
              <div style={{ fontWeight:700, color:"white", fontSize:16 }}>CNIT Portal</div>
              <div style={{ fontSize:11, color:"#14b8a6", fontFamily:"monospace" }}>Karnataka WCD Dept.</div>
            </div>
          </div>
          <h1 style={{ fontSize:36, fontWeight:800, color:"white", lineHeight:1.2, marginBottom:16 }}>
            Child Nutrition<br /><span style={{ color:"#14b8a6" }}>Intelligence</span> System
          </h1>
          <p style={{ color:"#94a3b8", lineHeight:1.7, maxWidth:340 }}>
            A unified platform for monitoring, predicting and improving child nutrition outcomes across Karnataka districts.
          </p>
          <div style={{ marginTop:"2.5rem", display:"flex", flexDirection:"column", gap:16 }}>
            {[
              ["Real-time Monitoring","Live child nutrition data across Karnataka"],
              ["Risk Prediction","AI-powered malnutrition risk classification"],
              ["5,000+ Records","District-wise health analytics dashboard"],
              ["Forecasting","6-month trend prediction with ML models"],
            ].map(([title, desc]) => (
              <div key={title} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:"#14b8a6", marginTop:6, flexShrink:0 }} />
                <div>
                  <div style={{ color:"white", fontWeight:600, fontSize:14 }}>{title}</div>
                  <div style={{ color:"#64748b", fontSize:12, marginTop:2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ color:"#334155", fontSize:11 }}>
          Project 38 · Karnataka Women & Child Development Department
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div style={{ width:"100%", maxWidth:420 }}>
          <div style={{ background:"rgba(23,32,51,0.8)", border:"1px solid rgba(148,163,184,0.1)", borderRadius:20, padding:"2rem" }}>
            {/* Tabs */}
            <div style={{ display:"flex", background:"rgba(15,23,42,0.8)", borderRadius:12, padding:4, marginBottom:"1.5rem" }}>
              {["signin","signup"].map(m => (
                <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                  style={{ flex:1, padding:"10px", borderRadius:10, border:"none", cursor:"pointer", fontWeight:600, fontSize:14, transition:"all 0.2s",
                    background: mode===m ? "linear-gradient(135deg,#0d9488,#14b8a6)" : "transparent",
                    color: mode===m ? "white" : "#64748b" }}>
                  {m === "signin" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <h2 style={{ color:"white", fontWeight:700, fontSize:20, marginBottom:4 }}>
              {mode === "signin" ? "Welcome back" : "Create your account"}
            </h2>
            <p style={{ color:"#94a3b8", fontSize:13, marginBottom:"1.5rem" }}>
              {mode === "signin" ? "Access the Karnataka CNIT Portal" : "Register to access the nutrition portal"}
            </p>

            {error && <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)", color:"#fca5a5", padding:"12px 16px", borderRadius:10, fontSize:13, marginBottom:16 }}>{error}</div>}
            {success && <div style={{ background:"rgba(20,184,166,0.1)", border:"1px solid rgba(20,184,166,0.2)", color:"#5eead4", padding:"12px 16px", borderRadius:10, fontSize:13, marginBottom:16 }}>{success}</div>}

            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {mode === "signup" && (
                <div>
                  <label style={{ display:"block", color:"#94a3b8", fontSize:12, fontWeight:500, marginBottom:6 }}>Full Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                    placeholder="Your full name" required
                    className="input-field" style={{ width:"100%", padding:"12px 16px", borderRadius:10, fontSize:14 }} />
                </div>
              )}
              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:12, fontWeight:500, marginBottom:6 }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" required
                  className="input-field" style={{ width:"100%", padding:"12px 16px", borderRadius:10, fontSize:14 }} />
              </div>
              <div>
                <label style={{ display:"block", color:"#94a3b8", fontSize:12, fontWeight:500, marginBottom:6 }}>Password</label>
                <div style={{ position:"relative" }}>
                  <input type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Your password" required
                    className="input-field" style={{ width:"100%", padding:"12px 44px 12px 16px", borderRadius:10, fontSize:14 }} />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#64748b" }}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary"
                style={{ padding:"14px", borderRadius:12, border:"none", cursor:"pointer", fontSize:14, marginTop:4, opacity: loading ? 0.7 : 1 }}>
                {loading ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>
          </div>
          <p style={{ textAlign:"center", color:"#475569", fontSize:12, marginTop:20 }}>
            Smart Public Nutrition Deficiency Tracking System<br />Karnataka WCD Department
          </p>
        </div>
      </div>
    </div>
  );
}
