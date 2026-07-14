import { initChat, clearChat, setCharacter } from "./chat.js";
import { characters } from "./characters.js";

const container = () => document.getElementById("view-container");

function renderCharacterSelect() {
  container().innerHTML = `
    <div class="view-content">
      <h1 class="select__title">Elige tu personaje</h1>
      <div class="character-grid">
        ${Object.values(characters).map(char => `
          <div class="character-card" data-id="${char.id}" style="--card-accent: ${char.accentColor}">
            <div class="flip-content">
              <div class="flip-card-back">
                <img src="${char.fullBody}" alt="${char.name}" class="flip-card-image" />
              </div>
              <div class="flip-card-front">
                <h2 class="character-card__name">${char.name}</h2>
                <p class="character-card__fullname">${char.fullName}</p>
                <p class="character-card__desc">${char.description}</p>
                <button class="btn character-card__btn">Seleccionar</button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  document.querySelectorAll('.character-card').forEach(card => {
    card.addEventListener('click', () => {
      navigateTo(`/home/${card.dataset.id}`);
    });
  });
}

function renderCharacter(charId) {
  const char = characters[charId];
  if (!char) return renderNotFound();

  container().innerHTML = `
    <div class="view-content">
      <img src="${char.avatar}" alt="${char.name}" class="home__avatar" />
      <p class="home__eyebrow">${char.fullName} · ${char.name}</p>
      <h1 class="home__title">Yo soy ${char.name}</h1>
      <p class="home__description">${char.description}</p>
      <button class="btn" id="btn-chat">Empezar a chatear</button>
    </div>
  `;

  document.getElementById("btn-chat").addEventListener("click", () => {
    navigateTo(`/chat/${charId}`);
  });
}

function renderChatWithCharacter(charId) {
  const char = characters[charId];
  if (!char) return renderNotFound();

  container().innerHTML = `
    <div class="chat-layout">
      <div class="chat-toolbar">
        <button class="chat-back" id="btn-back" title="Volver">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><polyline points="12 19 5 12 12 5"/></svg>
          Volver
        </button>
        <button class="chat-clear" id="btn-clear-chat" title="Limpiar conversación">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
          Limpiar
        </button>
      </div>
      <section class="messages" id="messages-container">
        <div class="typing-indicator" id="typing-indicator">
          <img src="${char.avatar}" alt="${char.name}" class="x-avatar" />
          <span>${char.typingText}</span>
          <div class="typing-dots">
            <i></i><i></i><i></i>
          </div>
        </div>
      </section>
      <form class="composer" id="composer-form">
        <input
          class="composer__input"
          id="composer-input"
          type="search"
          placeholder="Escribí tu mensaje..."
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />
        <button class="composer__send" type="submit" aria-label="Enviar mensaje">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </form>
    </div>
  `;

  setCharacter(charId);
  initChat();

  document.getElementById("btn-clear-chat").addEventListener("click", () => {
    if (confirm("¿Borrar la conversación?")) clearChat();
  });

  document.getElementById("btn-back").addEventListener("click", () => {
    navigateTo("/home");
  });
}

function renderAbout() {
  container().innerHTML = `
    <div class="view-content">
      <h1 class="about__title">Acerca del Proyecto</h1>
      <div class="about__section">
        <h3>Descripción</h3>
        <p>ChatVengers es una app donde los fans pueden chatear con 
        Iron Man y otros héroes de los Avengers usando inteligencia 
        artificial. Integramos Google Gemini AI de forma segura para 
        que cada personaje mantenga su personalidad.</p>
      </div>
      <div class="about__section">
        <h3>Tecnologías</h3>
        <ul class="tech-list">
          <li>Vanilla JS (ES Modules)</li>
          <li>History API</li>
          <li>CSS Mobile-first</li>
          <li>Clipboard API</li>
          <li>Vercel Functions</li>
          <li>Google Gemini AI</li>
          <li>Vitest</li>
        </ul>
      </div>
    </div>
    <footer class="about-footer">
      Desarrollado con fines educativos · 2026
    </footer>
  `;
}

function renderNotFound() {
  container().innerHTML = `
    <div class="view-content not-found">
      <h1>404</h1>
      <p>Esta página no existe.</p>
      <a href="/home" class="btn">Volver al inicio</a>
    </div>
  `;
}

const routes = {
  "/": renderCharacterSelect,
  "/home": renderCharacterSelect,
  "/home/ironman": () => renderCharacter("ironman"),
  "/home/capitan": () => renderCharacter("capitan"),
  "/home/spiderman": () => renderCharacter("spiderman"),
  "/chat/ironman": () => renderChatWithCharacter("ironman"),
  "/chat/capitan": () => renderChatWithCharacter("capitan"),
  "/chat/spiderman": () => renderChatWithCharacter("spiderman"),
  "/about": renderAbout,
};

function router() {
  const render = routes[window.location.pathname];
  render ? render() : renderNotFound();
}

export function navigateTo(path) {
  history.pushState(null, "", path);
  router();
}

document.addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;
  if (e.ctrlKey || e.metaKey) return;
  if (link.target === "_blank") return;
  if (!link.href.startsWith(location.origin)) return;

  e.preventDefault();
  navigateTo(link.getAttribute("href"));
});

window.addEventListener("popstate", router);

router();
