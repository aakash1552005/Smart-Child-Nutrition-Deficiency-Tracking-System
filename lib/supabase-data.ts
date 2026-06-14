import { createClient } from "@/lib/supabase";

export async function fetchChildRecords(filters?: {
  district?: string;
  risk_level?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const supabase = createClient();
  let query = supabase.from("child_records").select("*", { count: "exact" });

  if (filters?.district && filters.district !== "All")
    query = query.eq("district", filters.district);
  if (filters?.risk_level && filters.risk_level !== "All")
    query = query.eq("risk_level", filters.risk_level);
  if (filters?.search)
    query = query.or(`child_id.ilike.%${filters.search}%,name.ilike.%${filters.search}%`);

  query = query
    .order("child_id", { ascending: true })
    .range(filters?.offset ?? 0, (filters?.offset ?? 0) + (filters?.limit ?? 50) - 1);

  const { data, error, count } = await query;
  return { data: data ?? [], error, count: count ?? 0 };
}

export async function fetchDashboardStats() {
  const supabase = createClient();
  const { count: total } = await supabase.from("child_records").select("*", { count: "exact", head: true });
  const { count: high } = await supabase.from("child_records").select("*", { count: "exact", head: true }).eq("risk_level", "High");
  const { count: medium } = await supabase.from("child_records").select("*", { count: "exact", head: true }).eq("risk_level", "Medium");
  const { count: low } = await supabase.from("child_records").select("*", { count: "exact", head: true }).eq("risk_level", "Low");
  const { count: enrolled } = await supabase.from("child_records").select("*", { count: "exact", head: true }).eq("scheme_enrolled", true);

  return {
    total: total ?? 0,
    high: high ?? 0,
    medium: medium ?? 0,
    low: low ?? 0,
    healthy: low ?? 0,
    coverage: total ? Math.round(((enrolled ?? 0) / total) * 1000) / 10 : 0,
  };
}

export async function fetchDistrictStats() {
  const supabase = createClient();
  const { data } = await supabase.from("child_records").select("district, risk_level");
  if (!data) return [];

  const map: Record<string, { total:number; high:number; medium:number; low:number }> = {};
  for (const row of data) {
    if (!map[row.district]) map[row.district] = { total:0, high:0, medium:0, low:0 };
    map[row.district].total++;
    if (row.risk_level === "High") map[row.district].high++;
    else if (row.risk_level === "Medium") map[row.district].medium++;
    else map[row.district].low++;
  }
  return Object.entries(map).map(([district, stats]) => ({ district, ...stats }));
}

export async function fetchDeficiencyStats() {
  const supabase = createClient();
  const { data, count } = await supabase.from("child_records").select("vitamin_a_deficient,iron_deficient,underweight,wasting,stunting", { count: "exact" });
  if (!data || !count) return [];

  const keys = ["vitamin_a_deficient","iron_deficient","underweight","wasting","stunting"];
  const labels = ["Vitamin A","Iron","Underweight","Wasting","Stunting"];
  const colors = ["#ec4899","#8b5cf6","#3b82f6","#f59e0b","#ef4444"];

  return keys.map((k, i) => ({
    name: labels[i],
    value: Math.round((data.filter((r:any) => r[k] === true).length / count) * 1000) / 10,
    color: colors[i],
  }));
}