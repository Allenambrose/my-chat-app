const socket = io();
let username;

// UI elements
const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const onlineCount = document.getElementById("onlineCount");
const typingBox = document.getElementById("typingBox");
const emojiBtn = document.getElementById("emojiBtn");
const emojiPanel = document.getElementById("emojiPanel");

// -----------------------------
// TIME FORMATTER
// -----------------------------
function formatTime(t) {
  const date = new Date(t);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// -----------------------------
// JOIN CHAT
// -----------------------------
joinBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (!username) return;

  loginScreen.style.display = "none";
  chatScreen.style.display = "block";

  socket.emit("join", username);
});

// -----------------------------
// SEND TEXT MESSAGE
// -----------------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.trim() === "") return;

  socket.emit("message", {
    username,
    text: input.value,
    timestamp: Date.now()
  });

  input.value = "";
});

// -----------------------------
// EMOJI PANEL TOGGLE
// -----------------------------
emojiBtn.addEventListener("click", () => {
  emojiPanel.classList.toggle("hidden");
});

// -----------------------------
// CLICK EMOJI TO SEND
// -----------------------------
emojiPanel.addEventListener("click", (e) => {
  if (e.target.classList.contains("emoji")) {
    socket.emit("message", {
      username,
      text: e.target.textContent,
      timestamp: Date.now()
    });
  }
});

// -----------------------------
// TYPING INDICATOR
// -----------------------------
input.addEventListener("input", () => {
  socket.emit("typing", username);
});

socket.on("typing", (user) => {
  if (user !== username) {
    typingBox.textContent = `${user} is typing...`;

    setTimeout(() => {
      typingBox.textContent = "";
    }, 1500);
  }
});

// -----------------------------
// ONLINE COUNT
// -----------------------------
socket.on("usersOnline", (count) => {
  onlineCount.textContent = count;
});

// -----------------------------
// LOAD CHAT HISTORY
// -----------------------------
socket.on("chatHistory", (history) => {
  messages.innerHTML = "";
  history.forEach(msg => renderMessage(msg));
});

// -----------------------------
// RECEIVE MESSAGE
// -----------------------------
socket.on("message", (msg) => {
  renderMessage(msg);
});

// -----------------------------
// DELETE HANDLER FROM SERVER
// -----------------------------
socket.on("messageDeleted", (id) => {
  const msgElement = document.querySelector(`[data-id='${id}']`);
  if (msgElement) {
    msgElement.classList.add("deleted");
    msgElement.querySelector(".text").textContent = "(message deleted)";
  }
});

// -----------------------------
// RENDER MESSAGE FUNCTION
// -----------------------------
function renderMessage(msg) {
  const li = document.createElement("li");
  li.dataset.id = msg._id;

  const time = `<span class="time">${formatTime(msg.timestamp)}</span>`;

  if (msg.username === "System") {
    li.classList.add("system");
    li.innerHTML = `${msg.text} ${time}`;
  }
  else if (msg.username === username) {
    li.classList.add("my-msg");
    li.innerHTML = `
      <span class="text">${msg.text}</span>
      ${time}
    `;
  }
  else {
    li.classList.add("their-msg");
    li.innerHTML = `
      <span class="user">${msg.username}</span>: 
      <span class="text">${msg.text}</span>
      ${time}
    `;
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
