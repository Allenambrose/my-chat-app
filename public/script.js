const socket = io();
let username;

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

// Show online user count
socket.on("online users", (count) => {
  document.getElementById("onlineCount").textContent = `Online: ${count}`;
});

// When history comes from DB
socket.on("chat history", (messagesList) => {
  messages.innerHTML = "";
  messagesList.forEach((msgObj) => {
    displayMessage(msgObj);
  });
});

// Time Format Function
function formatTime(timestamp) {
  const now = new Date();
  const time = new Date(timestamp);

  const diffMs = now - time;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;

  if (time.toDateString() === now.toDateString()) {
    return time.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "numeric",
      hour12: true
    });
  }
  
  return time.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// LOGIN
joinBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (username === "") return;

  loginScreen.style.display = "none";
  chatScreen.style.display = "block";

  socket.emit("user joined", username);
});

// SEND MESSAGE
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value.trim() === "") return;

  socket.emit("chat message", {
    username,
    text: input.value,
    timestamp: Date.now()
  });

  input.value = "";
});

// Display messages in chat
socket.on("chat message", (msgObj) => {
  displayMessage(msgObj);
});

function displayMessage(msgObj) {
  const li = document.createElement("li");
  const formattedTime = formatTime(msgObj.timestamp);

  if (msgObj.system) {
    li.classList.add("system-message");
    li.innerHTML = `<strong>System:</strong> ${msgObj.text}<span class="time">${formattedTime}</span>`;
  } else if (msgObj.username === username) {
    li.classList.add("my-message");
    li.innerHTML = `<strong>You:</strong> ${msgObj.text}<span class="time">${formattedTime}</span>`;
  } else {
    li.classList.add("other-message");
    li.innerHTML = `<strong>${msgObj.username}:</strong> ${msgObj.text}<span class="time">${formattedTime}</span>`;
  }

  messages.appendChild(li);
  messages.scrollTop = messages.scrollHeight;
}
