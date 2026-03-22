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

export async function generateScript(hook, format, cta, notes, existingScript) {
  const res = await fetch(`${API_URL}/api/script`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' }, body: JSON.stringify({ hook, format, cta, notes, existingScript }) });
  return res.json();
}

export async function getProfile() {
  const res = await fetch(`${API_URL}/api/profile`, { headers: { "ngrok-skip-browser-warning": "true" } });
  return res.json();
}

export async function getIntelligence() {
  const res = await fetch(`${API_URL}/api/intelligence`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}

export async function getMissions() {
  const res = await fetch(`${API_URL}/api/missions`, { headers: { "ngrok-skip-browser-warning": "true" } });
  return res.json();
}

export async function saveMissions(missions) {
  const res = await fetch(`${API_URL}/api/missions`, { method: "POST", headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }, body: JSON.stringify(missions) });
  return res.json();
}

export async function getPipeline() {
  const res = await fetch(`${API_URL}/api/pipeline`, { headers: { "ngrok-skip-browser-warning": "true" } });
  return res.json();
}

export async function savePipeline(pipeline) {
  const res = await fetch(`${API_URL}/api/pipeline`, { method: "POST", headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }, body: JSON.stringify(pipeline) });
  return res.json();
}

export async function getSakuraStatus() {
  const res = await fetch(`${API_URL}/api/sakura-status`, { headers: { "ngrok-skip-browser-warning": "true" } });
  return res.json();
}

export async function generateSessionBrief() {
  const res = await fetch(`${API_URL}/api/session-brief`, { method: "POST", headers: { "ngrok-skip-browser-warning": "true" } });
  return res.json();
}

export async function getScripts() {
  const res = await fetch(`${API_URL}/api/scripts`, { headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}

export async function deleteScript(id) {
  const res = await fetch(`${API_URL}/api/scripts/${id}`, { method: 'DELETE', headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}

export async function analyzeNow() {
  const res = await fetch(`${API_URL}/api/analyze-now`, { method: 'POST', headers: { 'ngrok-skip-browser-warning': 'true' } });
  return res.json();
}
