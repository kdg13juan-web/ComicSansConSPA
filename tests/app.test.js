// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initChat, resetMessages } from '../src/chat.js';

global.fetch = vi.fn();

function setupDOM() {
  document.body.innerHTML = `
    <section class="messages" id="messages-container">
      <div id="typing-indicator" class="typing-indicator"></div>
    </section>
    <form id="composer-form">
      <input id="composer-input" type="text" />
      <button type="submit">Enviar</button>
    </form>
  `;
  initChat();
}

function submitMessage(text) {
  const input = document.getElementById('composer-input');
  input.value = text;
  const form = document.getElementById('composer-form');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

const nextTick = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  fetch.mockClear();
  resetMessages();
  setupDOM();
});

describe('sendToGemini — caso exitoso', () => {
  it('llama a /api/functions con método POST', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: '¡Soy Iron Man!' }),
    });

    submitMessage('Hola');
    await nextTick();

    expect(fetch).toHaveBeenCalledWith(
      '/api/functions',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('agrega la respuesta de Iron Man al chat', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: '¡Soy Iron Man!' }),
    });

    submitMessage('Hola');
    await nextTick();

    const container = document.getElementById('messages-container');
    expect(container.textContent).toContain('¡Soy Iron Man!');
  });
});

describe('sendToGemini — error HTTP', () => {
  it('muestra el mensaje de error en el chat sin romper la UI', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    });

    submitMessage('Hola');
    await nextTick();

    const container = document.getElementById('messages-container');
    const errorBubble = container.querySelector('.message--character');
    expect(errorBubble).not.toBeNull();
  });
});

describe('sendToGemini — caída de red', () => {
  it('el catch maneja el error y muestra mensaje en el chat', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    submitMessage('Hola');
    await nextTick();

    const container = document.getElementById('messages-container');
    const errorBubble = container.querySelector('.message--character');
    expect(errorBubble).not.toBeNull();
  });
});