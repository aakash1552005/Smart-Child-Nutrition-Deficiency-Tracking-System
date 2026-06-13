const ML_API = process.env.NEXT_PUBLIC_ML_API_URL || 'https://cnit-ml-backend.onrender.com';

export async function predictRisk(data: {
  age_months: number; gender: number; district: string;
  mother_edu: number; income_level: number; scheme_enrolled: number;
  weight_kg: number; height_cm: number;
  vitamin_a?: number; iron?: number; underweight?: number; wasting?: number; stunting?: number;
}) {
  const res = await fetch(`${ML_API}/predict/risk`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function predictDeficiency(data: {
  age_months: number; gender: number; district: string;
  mother_edu: number; income_level: number; scheme_enrolled: number;
  weight_kg: number; height_cm: number;
}) {
  const res = await fetch(`${ML_API}/predict/deficiency`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getForecast() {
  const res = await fetch(`${ML_API}/forecast`);
  return res.json();
}

export async function getInsights() {
  const res = await fetch(`${ML_API}/insights`);
  return res.json();
}

export async function checkHealth() {
  const res = await fetch(`${ML_API}/health`);
  return res.json();
}