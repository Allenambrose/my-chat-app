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

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString("en-IN", {
    hour: "2-digit", minute: "2-digit", hour12: true
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
};

socket.on("chat message", (msg) => {
  const li = document.createElement("li");
  li.innerHTML = `
    <div class="${msg.username === username ? 'my-msg' : 'their-msg'}">
      <span class="user">${msg.username === username ? "You" : msg.username}</span>
      <span class="text">${msg.text}</span>
      <span class="time">${formatTime(msg.timestamp)}</span>
    </div>
  `;

  messages.appendChild(li);
  li.scrollIntoView({ behavior: "smooth" });

  socket.emit("seen", username);
});

socket.on("online users", users => {
  onlineCount.innerText = `Online: ${users.length}`;
});

input.addEventListener("input", () => {
  socket.emit("typing", username);
});

socket.on("typing", (user) => {
  showTyping(user);
});

function showTyping(user) {
  const id = "typing";
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement("div");
    el.id = id;
    el.classList.add("typing");
    messages.appendChild(el);
  }
  el.innerText = `${user} is typing...`;
  setTimeout(() => el.remove(), 2000);
}

socket.on("seen update", (user) => {
  document.querySelectorAll(".my-msg .time").forEach(t => {
    t.innerText = "Seen ✔✔";
  });
});

clearBtn.onclick = () => {
  socket.emit("clear chat", username);
};

socket.on("clear chat now", () => {
  messages.innerHTML = "";
});
