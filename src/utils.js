export function formatMessage(role, content, isError = false) {
  return { role, content, timestamp: Date.now(), isError };
}

export function convertToGeminiFormat(messages) {
  return messages.map((msg) => ({
    role: msg.role === 'character' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
}

export function isValidMessage(text) {
  return typeof text === 'string' && text.trim().length > 0;
}
