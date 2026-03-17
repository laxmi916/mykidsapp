const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

export async function post(endpoint, body) {
  const res = await fetch(`${BASE}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`API ${res.status}`);

  return res.json();
}

export async function get(endpoint) {
  const res = await fetch(`${BASE}/${endpoint}`);

  if (!res.ok) throw new Error(`API ${res.status}`);

  return res.json();
}

export function speak(text, lang = 'en-US', rate = 0.88, pitch = 1.05) {
  if (!('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = rate;
  u.pitch = pitch;

  const voices = window.speechSynthesis.getVoices();

  const best = voices.find(
    v => v.name.includes('Google') && v.lang.startsWith(lang.split('-')[0])
  );

  if (best) u.voice = best;

  window.speechSynthesis.speak(u);
}

export const stopSpeak = () => {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
};

export function listen(onResult, onEnd) {
  const SR = window.webkitSpeechRecognition || window.SpeechRecognition;

  if (!SR) {
    alert('Voice needs Chrome! 🎤');
    return null;
  }

  const r = new SR();

  r.lang = 'en-US';
  r.interimResults = false;
  r.maxAlternatives = 1;

  r.onresult = e => onResult(e.results[0][0].transcript);

  r.onerror = () => onEnd?.();
  r.onend = () => onEnd?.();

  r.start();

  return r;
}
