const KEY_PREFIX = "chatvengers:";

function keyFor(charId) {
  return `${KEY_PREFIX}${charId}`;
}

export function loadMessages(charId) {
  try {
    const raw = localStorage.getItem(keyFor(charId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveMessages(charId, messages) {
  try {
    localStorage.setItem(keyFor(charId), JSON.stringify(messages));
  } catch {
    // localStorage no disponible (modo privado, cuota llena): se ignora
  }
}

export function clearMessages(charId) {
  try {
    localStorage.removeItem(keyFor(charId));
  } catch {
    // localStorage no disponible: se ignora
  }
}