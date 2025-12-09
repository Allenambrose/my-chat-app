const socket = io();
let username;

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const onlineCount = document.getElementById("onlineCount");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const clearBtn = document.getElementById("clearBtn");

const emojiBtn = document.getElementById("emojiBtn");
const emojiPanel = document.getElementById("emojiPanel");

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
}

joinBtn.onclick = () => {
  username = usernameInput.value.trim();
  if (!username) return;

  loginScreen.style.display = "none";
  chatScreen.style.display = "block";

  socket.emit("user joined", username);
};

form.onsubmit = (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;

  socket.emit("chat message", {
    username,
    text: input.value,
    timestamp: Date.now()
  });

  input.value = "";
  emojiPanel.classList.add("hidden");
};

socket.on("chat message", (msg) => {
  addMessage(msg);
  socket.emit("seen", username);
});

function addMessage(msg) {
  const li = document.createElement("li");
  li.dataset.id = msg.id;

  li.innerHTML = `
    <div class="${msg.username === username ? 'my-msg' : 'their-msg'}">
      <span class="user">${msg.username === username ? "You" : msg.username}</span>
      <span class="text">${msg.text}</span>
      <span class="time">${formatTime(msg.timestamp)}</span>
    </div>
  `;

  messages.appendChild(li);
  li.scrollIntoView({ behavior: "smooth" });

  // LONG PRESS DELETE
  let pressTimer;
  li.addEventListener("touchstart", () => {
    pressTimer = setTimeout(() => requestDelete(msg.id), 600);
  });
  li.addEventListener("touchend", () => clearTimeout(pressTimer));

  li.addEventListener("mousedown", () => {
    pressTimer = setTimeout(() => requestDelete(msg.id), 600);
  });
  li.addEventListener("mouseup", () => clearTimeout(pressTimer));
}

function requestDelete(id) {
  if (!confirm("Delete this message for everyone?")) return;
  socket.emit("delete message", { id, user: username });
}

// When server confirms deletion
socket.on("message deleted", (id) => {
  const msgEl = document.querySelector(`li[data-id="${id}"] .text`);
  if (msgEl) msgEl.innerText = "This message was deleted";
});

socket.on("online users", users => {
  onlineCount.innerText = `Online: ${users.length}`;
});

input.addEventListener("input", () => {
  socket.emit("typing", username);
});

socket.on("typing", (user) => showTyping(user));

function showTyping(user) {
  let el = document.getElementById("typing");
  if (!el) {
    el = document.createElement("div");
    el.id = "typing";
    el.className = "typing";
    messages.appendChild(el);
  }
  el.innerText = `${user} is typing...`;
  setTimeout(() => el.remove(), 2000);
}

socket.on("seen update", () => {
  document
    .querySelectorAll(".my-msg .time")
    .forEach(t => t.innerText = "Seen ✔✔");
});

clearBtn.onclick = () => socket.emit("clear chat", username);

socket.on("clear chat now", () => messages.innerHTML = "");

emojiBtn.onclick = () => emojiPanel.classList.toggle("hidden");

emojiPanel.onclick = (e) => {
  if (e.target.innerText.trim()) {
    input.value += e.target.innerText;
    input.focus();
  }
};
