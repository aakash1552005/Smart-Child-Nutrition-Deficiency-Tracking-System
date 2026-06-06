export const MOCK_STATS = {
  total: 5000, healthy: 4215, medium: 719, high: 66, coverage: 65.7, new_month: 234
};

export const DISTRICTS = [
  "Bengaluru Urban","Mysuru","Kalaburagi","Belagavi","Tumakuru",
  "Shivamogga","Dharwad","Ballari","Raichur","Vijayapura"
];

export const RISK_PIE = [
  { name: "Low", value: 84.3, color: "#14b8a6" },
  { name: "Medium", value: 14.4, color: "#f59e0b" },
  { name: "High", value: 1.3, color: "#ef4444" },
];

export const INDICATORS = [
  { name: "Vitamin A Deficiency", value: 15.2, color: "#ec4899" },
  { name: "Iron Deficiency", value: 13.8, color: "#8b5cf6" },
  { name: "Underweight", value: 4.1, color: "#3b82f6" },
  { name: "Wasting", value: 2.3, color: "#f59e0b" },
  { name: "Stunting", value: 1.8, color: "#ef4444" },
];

export const DISTRICT_DATA = [
  { district: "Kalaburagi", total: 520, high: 18, medium: 72, low: 430 },
  { district: "Raichur", total: 490, high: 15, medium: 68, low: 407 },
  { district: "Vijayapura", total: 480, high: 12, medium: 65, low: 403 },
  { district: "Ballari", total: 510, high: 8, medium: 60, low: 442 },
  { district: "Belagavi", total: 540, high: 6, medium: 55, low: 479 },
  { district: "Mysuru", total: 480, high: 4, medium: 48, low: 428 },
  { district: "Bengaluru Urban", total: 600, high: 2, medium: 40, low: 558 },
  { district: "Tumakuru", total: 460, high: 3, medium: 52, low: 405 },
];

export const WELFARE = [
  { name: "POSHAN Abhiyaan", enrolled: 2850, eligible: 5000, pct: 57 },
  { name: "Mid-Day Meal", enrolled: 3280, eligible: 4200, pct: 78 },
  { name: "ICDS", enrolled: 3100, eligible: 5000, pct: 62 },
  { name: "Iron-Folic Supplementation", enrolled: 2100, eligible: 3500, pct: 60 },
  { name: "Vitamin A Programme", enrolled: 1950, eligible: 3200, pct: 61 },
];

export const FORECAST = [
  { month: "Jul", high: 66, medium: 719 },
  { month: "Aug", high: 55, medium: 680 },
  { month: "Sep", high: 45, medium: 640 },
  { month: "Oct", high: 36, medium: 600 },
  { month: "Nov", high: 28, medium: 560 },
  { month: "Dec", high: 20, medium: 520 },
];

export function mockChildren(n = 80) {
  const names = ["Aarav","Priya","Kiran","Deepa","Rahul","Ananya","Vikram","Suma","Arjun","Nandini"];
  const risks = ["Low","Low","Low","Low","Low","Low","Low","Medium","Medium","High"];
  return Array.from({ length: n }, (_, i) => {
    const age = 6 + Math.floor(Math.random() * 54);
    const wt = +(5 + age * 0.15 + (Math.random()-0.5)*2).toFixed(1);
    const ht = +(60 + age * 0.3 + (Math.random()-0.5)*5).toFixed(1);
    const risk = risks[Math.floor(Math.random() * risks.length)];
    return {
      id: i,
      child_id: "KA" + String(i).padStart(5,"0"),
      name: names[i % names.length] + " " + String.fromCharCode(65 + i % 26) + ".",
      age_months: age,
      gender: i % 2 === 0 ? "Male" : "Female",
      district: DISTRICTS[i % DISTRICTS.length],
      weight_kg: wt,
      height_cm: ht,
      bmi: +(wt / (ht/100)**2).toFixed(1),
      risk_level: risk,
      scheme_enrolled: Math.random() > 0.4,
    };
  });
}
