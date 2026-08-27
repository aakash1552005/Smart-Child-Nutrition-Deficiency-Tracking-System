"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, Users, AlertTriangle, Microscope, Gift, Brain, TrendingUp, Settings, LogOut, X, Menu } from "lucide-react";
import { createClient } from "@/lib/supabase";

const NAV = [
  { href:"/dashboard", icon:Activity, label:"Executive Overview" },
  { href:"/dashboard/records", icon:Users, label:"Child Health Records" },
  { href:"/dashboard/risk", icon:AlertTriangle, label:"Risk Prediction" },
  { href:"/dashboard/deficiency", icon:Microscope, label:"Deficiency Detection" },
  { href:"/dashboard/schemes", icon:Gift, label:"Welfare Schemes" },
  { href:"/dashboard/insights", icon:Brain, label:"AI Insights" },
  { href:"/dashboard/forecast", icon:TrendingUp, label:"Forecasting" },
  { href:"/dashboard/admin", icon:Settings, label:"Admin Panel" },
];

const S: any = {
  sidebar: { width:256, background:"rgba(15,23,42,0.98)", borderRight:"1px solid rgba(148,163,184,0.08)", display:"flex", flexDirection:"column", height:"100vh", flexShrink:0 },
  logo: { padding:"24px 20px", borderBottom:"1px solid rgba(148,163,184,0.08)", display:"flex", alignItems:"center", gap:12 },
  logoIcon: { width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#0d9488,#14b8a6)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  nav: { flex:1, padding:"16px 12px", overflowY:"auto" as const },
  navLabel: { fontSize:11, fontWeight:600, color:"#475569", textTransform:"uppercase" as const, letterSpacing:"0.05em", padding:"0 12px", marginBottom:8 },
  footer: { padding:"12px", borderTop:"1px solid rgba(148,163,184,0.08)" },
  main: { flex:1, display:"flex", flexDirection:"column" as const, overflow:"hidden", minWidth:0 },
  topbar: { padding:"12px 24px", borderBottom:"1px solid rgba(148,163,184,0.08)", display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(15,23,42,0.9)", flexShrink:0, backdropFilter:"blur(8px)" },
  content: { flex:1, overflowY:"auto" as const },
  pageFooter: { padding:"12px 24px", borderTop:"1px solid rgba(148,163,184,0.06)", fontSize:11, color:"#334155", flexShrink:0 },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({ total: 5000, high: 66 });
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function checkAuthAndLoadData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push("/auth");
        return;
      }
      setUser({
        email: authUser.email,
        name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Portal User",
      });

      const [totalRes, highRes] = await Promise.all([
        supabase.from("child_records").select("*", { count:"exact", head:true }),
        supabase.from("child_records").select("*", { count:"exact", head:true }).ilike("risk_label", "%high%"),
      ]);
      setStats({
        total: totalRes.count ?? 5000,
        high:  highRes.count ?? 66,
      });
    }
    checkAuthAndLoadData();
  }, [router]);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  function NavItems() {
    return (
      <>
        <div style={S.logo}>
          <div style={S.logoIcon}><Activity size={18} color="white" /></div>
          <div>
            <div style={{ fontWeight:700, color:"white", fontSize:14 }}>CNIT Portal</div>
            <div style={{ fontSize:11, color:"#14b8a6", fontFamily:"monospace" }}>Karnataka WCD Dept.</div>
          </div>
        </div>
        <div style={S.nav}>
          <div style={S.navLabel}>Navigation</div>
          {NAV.map(({ href, icon:Icon, label }) => {
            const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={"nav-item" + (active ? " active" : "")}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:8, fontSize:13, fontWeight:500, textDecoration:"none", color: active ? "#14b8a6" : "#94a3b8", marginBottom:2 }}>
                <Icon size={16} style={{ flexShrink:0 }} />
                {label}
              </Link>
            );
          })}
        </div>
        <div style={{ padding:"12px 16px", margin:"0 12px", borderRadius:12, background:"rgba(20,184,166,0.06)", border:"1px solid rgba(20,184,166,0.1)" }}>
          <div style={{ fontSize:11, color:"#64748b", marginBottom:8, fontWeight:500 }}>Quick Stats</div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
            <span style={{ color:"#94a3b8" }}>Total Records</span>
            <span style={{ color:"#14b8a6", fontFamily:"monospace", fontWeight:700 }}>{stats.total.toLocaleString()}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginTop:4 }}>
            <span style={{ color:"#94a3b8" }}>High Risk</span>
            <span style={{ color:"#ef4444", fontFamily:"monospace", fontWeight:700 }}>{stats.high}</span>
          </div>
        </div>
        <div style={S.footer}>
          <button onClick={signOut} className="nav-item"
            style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 12px", borderRadius:8, fontSize:13, fontWeight:500, color:"#94a3b8", background:"none", border:"none", cursor:"pointer", width:"100%" }}>
            <LogOut size={16} />Sign Out
          </button>
        </div>
      </>
    );
  }

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden" }}>
      {/* Desktop sidebar */}
      <aside style={S.sidebar} className="desktop-only">
        <NavItems />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div style={{ position:"fixed", inset:0, zIndex:50, display:"flex" }}>
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)" }} onClick={() => setOpen(false)} />
          <aside style={{ ...S.sidebar, position:"relative", zIndex:10 }}>
            <button onClick={() => setOpen(false)} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", cursor:"pointer", color:"#94a3b8" }}><X size={20} /></button>
            <NavItems />
          </aside>
        </div>
      )}

      <div style={S.main}>
        <header style={S.topbar}>
          {/* Left: mobile menu (mobile only) + LIVE indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <button
              onClick={() => setOpen(true)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"#94a3b8", display:"none" }}
              className="mobile-menu-btn">
              <Menu size={20} />
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <div className="live-dot" style={{ width:8, height:8, borderRadius:"50%", background:"#14b8a6" }} />
              <span style={{ fontSize:12, color:"#14b8a6", fontFamily:"monospace", fontWeight:500 }}>LIVE</span>
            </div>
          </div>

          {/* Right: last updated + user badge only */}
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:11, color:"#64748b", fontFamily:"monospace" }}>
              {new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })} · {new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" })}
            </div>
            <div style={{ width:1, height:28, background:"rgba(148,163,184,0.1)" }} />
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 12px", borderRadius:10, background:"rgba(30,41,59,0.6)", border:"1px solid rgba(148,163,184,0.08)" }}>
              <div style={{ width:28, height:28, borderRadius:8, background:"linear-gradient(135deg,#0d9488,#14b8a6)", display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontWeight:700, fontSize:12 }}>
                {user?.name ? user.name[0].toUpperCase() : "A"}
              </div>
              <div>
                <div style={{ fontSize:12, fontWeight:600, color:"white" }}>{user?.name || "Portal User"}</div>
                <div style={{ fontSize:10, color:"#64748b" }}>{user?.email || "Administrator"}</div>
              </div>
            </div>
          </div>
        </header>
        <main style={S.content}>{children}</main>
        <footer style={S.pageFooter}>
          Karnataka Child Nutrition Intelligence & Tracking Portal · Women & Child Development Dept., Govt. of Karnataka
        </footer>
      </div>
    </div>
  );
}