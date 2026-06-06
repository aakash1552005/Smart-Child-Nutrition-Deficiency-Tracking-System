export const DISTRICTS = ["Bengaluru Urban","Mysuru","Kalaburagi","Belagavi","Tumakuru","Shivamogga","Dharwad","Ballari","Raichur","Vijayapura"];

export const STATS = { total: 5000, healthy: 4215, medium: 719, high: 66, coverage: 65.7 };

export const DISTRICT_DATA = DISTRICTS.map((d, i) => ({
  district: d, total: 300 + i * 40,
  high: 2 + i * 3, medium: 30 + i * 8, low: 268 + i * 29
}));

export const RISK_PIE = [
  { name: "Low Risk", value: 84.3, color: "#14b8a6" },
  { name: "Medium Risk", value: 14.4, color: "#f59e0b" },
  { name: "High Risk", value: 1.3, color: "#ef4444" },
];

export const INDICATORS = [
  { name: "Vitamin A Deficiency", value: 15.2, color: "#ec4899" },
  { name: "Iron Deficiency", value: 13.8, color: "#8b5cf6" },
  { name: "Underweight", value: 4.1, color: "#3b82f6" },
  { name: "Wasting", value: 2.3, color: "#f59e0b" },
  { name: "Stunting", value: 1.8, color: "#ef4444" },
];

export const FORECAST = Array.from({ length: 6 }, (_, i) => {
  const d = new Date(); d.setMonth(d.getMonth() + i);
  return { month: d.toLocaleString("default", { month: "short" }), high: Math.max(20, 66 - i * 7), medium: Math.max(600, 719 - i * 18) };
});

export const SCHEMES = [
  { name: "POSHAN Abhiyaan", enrolled: 2850, eligible: 5000, pct: 57 },
  { name: "Mid-Day Meal", enrolled: 3280, eligible: 4200, pct: 78 },
  { name: "ICDS", enrolled: 3100, eligible: 5000, pct: 62 },
  { name: "Iron-Folic Supplementation", enrolled: 2100, eligible: 3500, pct: 60 },
  { name: "Vitamin A Programme", enrolled: 1950, eligible: 3200, pct: 61 },
];

export function makeChildren(n = 80) {
  const names = ["Aarav","Priya","Kiran","Deepa","Rahul","Ananya","Vikram","Suma","Arjun","Nandini"];
  const risks = ["Low","Low","Low","Low","Low","Low","Medium","Medium","High"] as const;
  return Array.from({ length: n }, (_, i) => {
    const age = 6 + Math.floor(Math.random() * 54);
    const wt = +(5 + age * 0.15 + (Math.random() - 0.5) * 2).toFixed(1);
    const ht = +(60 + age * 0.3 + (Math.random() - 0.5) * 5).toFixed(1);
    const risk = risks[Math.floor(Math.random() * risks.length)];
    return {
      id: `KA${String(i).padStart(5,"0")}`,
      name: names[i % names.length] + " " + String.fromCharCode(65 + i % 26) + ".",
      age, gender: i % 2 === 0 ? "Male" : "Female",
      district: DISTRICTS[i % DISTRICTS.length],
      weight: wt, height: ht,
      bmi: +(wt / (ht / 100) ** 2).toFixed(1),
      risk, enrolled: Math.random() > 0.4,
    };
  });
}
