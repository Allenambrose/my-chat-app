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

// 📌 Format Time (Full — Date + AM/PM)
function formatTime(timestamp) {
  const date = new Date(timestamp);

  return date.toLocaleString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// Join Chat
joinBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (username === "") return;

  loginScreen.style.display = "none";
  chatScreen.style.display = "block";

  socket.emit("user joined", username);
});

// Send Chat Message
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message", {
      username: username,
      text: input.value,
      timestamp: Date.now()
    });

    input.value = "";
  }
});

// Receive Chat Messages
socket.on("chat message", (msgObj) => {
  const item = document.createElement("li");
  const formattedTime = formatTime(msgObj.timestamp);

  if (msgObj.username === "System") {
    item.classList.add("system-message");
    item.innerHTML = `${msgObj.text} <span class="time">${formattedTime}</span>`;
  }
  else if (msgObj.username === username) {
    item.classList.add("my-message");
    item.innerHTML = `<strong>You:</strong> ${msgObj.text} 
      <span class="time">${formattedTime}</span>`;
  }
  else {
    item.classList.add("other-message");
    item.innerHTML = `<strong>${msgObj.username}:</strong> ${msgObj.text} 
      <span class="time">${formattedTime}</span>`;
  }

  messages.appendChild(item);
  messages.lastElementChild?.scrollIntoView({ behavior: "smooth" });
});

// Update Online User Count
socket.on("online users", (count) => {
  if (onlineCount) {
    onlineCount.textContent = count;
  }
});
