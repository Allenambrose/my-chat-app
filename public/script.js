const socket = io();
let username;

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const onlineCount = document.getElementById("onlineCount");

function formatTime(t) {
  const date = new Date(t);
  return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

joinBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (!username) return;

  loginScreen.style.display = "none";
  chatScreen.style.display = "block";

  socket.emit("join", username);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.trim() !== "") {
    socket.emit("message", {
      username,
      text: input.value,
      timestamp: Date.now()
    });
    input.value = "";
  }
});

// SEND EMOJIS
document.querySelectorAll(".emojiBtn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    socket.emit("message", {
      username,
      text: e.target.textContent,
      timestamp: Date.now()
    });
  });
});

socket.on("usersOnline", (count) => {
  onlineCount.textContent = count;
});

socket.on("message", (msg) => {
  const item = document.createElement("li");
  const time = `<span class="time">${formatTime(msg.timestamp)}</span>`;

  if (msg.username === "System") {
    item.classList.add("system");
    item.innerHTML = `${msg.text} ${time}`;
  } else if (msg.username === username) {
    item.classList.add("me");
    item.innerHTML = `You: ${msg.text} ${time}`;
  } else {
    item.classList.add("other");
    item.innerHTML = `${msg.username}: ${msg.text} ${time}`;
  }

  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
});
