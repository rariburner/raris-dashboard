const API_URL = 'https://incogitable-orville-superwise.ngrok-free.dev';

export async function getIdeas() {
  const res = await fetch(`${API_URL}/api/ideas`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}

export async function getNotifications() {
  const res = await fetch(`${API_URL}/api/notifications`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}

export async function getStatus() {
  const res = await fetch(`${API_URL}/api/status`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}

export async function pauseScraping() {
  const res = await fetch(`${API_URL}/api/pause`, { method: 'POST', headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}

export async function resumeScraping() {
  const res = await fetch(`${API_URL}/api/resume`, { method: 'POST', headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}

export async function scrapeNow() {
  const res = await fetch(`${API_URL}/api/scrape-now`, { method: 'POST', headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}

export async function generateScript(hook, format, cta) {
  const res = await fetch(`${API_URL}/api/script`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ hook, format, cta }) });
  return res.json();
}

export async function analyzeNow() {
  const res = await fetch(`${API_URL}/api/analyze-now`, { method: 'POST', headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}
