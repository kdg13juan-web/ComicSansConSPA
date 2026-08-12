// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { initChat, resetMessages, setCharacter, clearChat } from '../src/chat.js';

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
  localStorage.clear();
  setupDOM();
});

describe('portada de inicio', () => {
  it('muestra la portada cuando la ruta es /inicio', async () => {
    document.body.innerHTML = '<main id="view-container"></main>';
    window.history.replaceState({}, '', '/inicio');
    vi.resetModules();

    await import('../src/app.js');

    const container = document.getElementById('view-container');
    expect(container.textContent).toContain('Los Avengers');
  });
});

describe('navegación de personajes', () => {
  it('abre el chat desde la ruta /chat/ironman', async () => {
    document.body.innerHTML = '<main id="view-container"></main>';
    window.history.replaceState({}, '', '/chat/ironman');
    vi.resetModules();

    await import('../src/app.js');

    const container = document.getElementById('view-container');
    expect(container.textContent).toContain('Iron Man');
  });
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

describe('persistencia en localStorage', () => {
  it('guarda los mensajes en localStorage al enviar', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: '¡Soy Iron Man!' }),
    });

    setCharacter('ironman');
    submitMessage('Hola');
    await nextTick();

    const stored = JSON.parse(localStorage.getItem('chatvengers:ironman'));
    expect(Array.isArray(stored)).toBe(true);
    expect(stored.length).toBeGreaterThan(0);
  });

  it('restaura el historial guardado de un personaje', async () => {
    localStorage.setItem(
      'chatvengers:ironman',
      JSON.stringify([{ role: 'user', content: 'Mensaje guardado ayer', timestamp: 1 }])
    );
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reply: '¡Recordado!' }),
    });

    setCharacter('ironman');
    submitMessage('Hola');
    await nextTick();

    const container = document.getElementById('messages-container');
    expect(container.textContent).toContain('Mensaje guardado ayer');
    expect(container.textContent).toContain('¡Recordado!');
  });

  it('borra el historial del storage con clearChat', () => {
    localStorage.setItem(
      'chatvengers:ironman',
      JSON.stringify([{ role: 'user', content: 'x', timestamp: 1 }])
    );

    setCharacter('ironman');
    clearChat();

    expect(localStorage.getItem('chatvengers:ironman')).toBeNull();
  });

  it('no rompe el chat si el JSON guardado está corrupto', () => {
    localStorage.setItem('chatvengers:ironman', '{esto-no-es-json');
    setCharacter('ironman');
    localStorage.removeItem('chatvengers:ironman');
  });
});