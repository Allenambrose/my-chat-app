const socket = io();
let username;

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

function formatTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);

  const diffMs = now - time;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;

  return time.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "numeric",
    hour12: true
  });
}

// 🕒 Update timestamps every 30 seconds
setInterval(() => {
  document.querySelectorAll(".time").forEach((timeElement) => {
    const originalTS = parseInt(timeElement.dataset.ts);
    if (!isNaN(originalTS)) {
      timeElement.innerText = formatTime(originalTS);
    }
  });
}, 30000); // 30 seconds refresh

joinBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (!username) return;

  loginScreen.style.display = "none";
  chatScreen.style.display = "block";

  socket.emit("user joined", username);
});

input.addEventListener("input", () => {
  socket.emit("typing", username);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;

  socket.emit("chat message", {
    username,
    text: input.value,
    timestamp: Date.now()
  });

  input.value = "";
});

socket.on("chat message", (msgObj) => {
  const li = document.createElement("li");
  const formatted = formatTime(msgObj.timestamp);

  li.classList.add(msgObj.username === username ? "my-message" :
                   msgObj.username === "System" ? "system-message" :
                   "other-message");

  li.innerHTML = `
    <strong>${msgObj.username === username ? "You" : msgObj.username}:</strong> 
    ${msgObj.text}
    <span class="time" data-ts="${msgObj.timestamp}">
      ${formatted}
    </span>
  `;

  messages.appendChild(li);
  li.scrollIntoView({ behavior: "smooth" });
});
