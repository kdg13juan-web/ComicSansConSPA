import { formatMessage, isValidMessage } from "./utils.js";

let messages = [];

export function resetMessages() {
  messages = [];
}

export function clearChat() {
  messages = [];
  renderMessages();
}

const ICON_COPY = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>`;
const ICON_CHECK = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

function formatTime(ts) {
  return new Date(ts).toLocaleString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function createCopyButton(content) {
  const btn = document.createElement("button");
  btn.className = "message__copy";
  btn.title = "Copiar mensaje";
  btn.innerHTML = ICON_COPY;

  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(content).then(() => {
      btn.innerHTML = ICON_CHECK;
      btn.classList.add("message__copy--done");
      setTimeout(() => {
        btn.innerHTML = ICON_COPY;
        btn.classList.remove("message__copy--done");
      }, 1500);
    });
  });

  return btn;
}

function renderMessages() {
  const container = document.getElementById("messages-container");
  if (!container) return;

  const indicator = document.getElementById("typing-indicator");

  container.innerHTML = "";

  if (messages.length === 0) {
    container.innerHTML = `
      <div class="chat-empty">
        <img src="assets/reactor.png" alt="Reactor Ark" class="chat-empty__hat" />
        <p class="chat-empty__title">¡Bienvenido al taller!</p>
        <p class="chat-empty__hint">Escribí tu primer mensaje para hablar con Iron Man.</p>
      </div>
    `;
    if (indicator) container.appendChild(indicator);
    return;
  }

  messages.forEach((msg) => {
    const footer = document.createElement("div");
    footer.className = "message__footer";

    const time = document.createElement("span");
    time.className = "message__time";
    time.textContent = formatTime(msg.timestamp);

    footer.appendChild(time);
    footer.appendChild(createCopyButton(msg.content));

    if (msg.role === "user") {
      const el = document.createElement("div");
      el.className = "message message--user";
      el.textContent = msg.content;
      el.appendChild(footer);
      container.appendChild(el);
    } else {
      const el = document.createElement("div");
      el.className = "message message--character";
      el.textContent = msg.content;

      const hat = document.createElement("img");
      hat.src = "assets/reactor.png";
      hat.alt = "";
      hat.className = "bubble-hat";
      hat.width = 44;
      hat.height = 34;

      el.appendChild(hat);
      el.appendChild(footer);
      container.appendChild(el);
    }
  });

  if (indicator) container.appendChild(indicator);

  const last = container.lastElementChild;
  if (last?.scrollIntoView)
    last.scrollIntoView({ behavior: "smooth", block: "end" });
}

function addMessage(role, content) {
  messages.push(formatMessage(role, content));
  renderMessages();
}

function showTyping() {
  const indicator = document.getElementById("typing-indicator");
  if (!indicator) return;
  indicator.classList.add("visible");
  if (indicator.scrollIntoView)
    indicator.scrollIntoView({ behavior: "smooth", block: "end" });
}

function hideTyping() {
  document.getElementById("typing-indicator")?.classList.remove("visible");
}

async function sendToGemini(input, btn) {
  if (input) input.disabled = true;
  if (btn) btn.disabled = true;

  showTyping();

  try {
    const payload = messages.slice(-12);

    const response = await fetch("/api/functions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: payload }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error: ${response.status}`);
    }

    addMessage("character", data.reply);
  } catch (err) {
    const msg =
      err.message || "Iron Man está en el taller, intentá de nuevo.";
    addMessage("character", msg);
  } finally {
    if (input) input.disabled = false;
    if (btn) btn.disabled = false;
    input?.focus();
    hideTyping();
  }
}

export function initChat() {
  const form = document.getElementById("composer-form");
  const input = document.getElementById("composer-input");
  if (!form || !input) return;

  const btn = form.querySelector(".composer__send");

  renderMessages();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!isValidMessage(text)) return;

    addMessage("user", text);
    input.value = "";
    sendToGemini(input, btn);
  });
}