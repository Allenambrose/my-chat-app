const socket = io();
let username;

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

// Typing Indicator
const typingIndicator = document.createElement("p");
typingIndicator.id = "typingIndicator";
typingIndicator.style.color = "gray";
typingIndicator.style.fontSize = "14px";
typingIndicator.style.margin = "5px";
typingIndicator.style.display = "none";
chatScreen.prepend(typingIndicator);

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

joinBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (username === "") return;

  loginScreen.style.display = "none";
  chatScreen.style.display = "block";

  socket.emit("user joined", username);
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value.trim() === "") return;

  socket.emit("chat message", {
    username: username,
    text: input.value,
    timestamp: Date.now()
  });

  input.value = "";
  typingIndicator.style.display = "none";
});

socket.on("chat message", (msgObj) => {
  const item = document.createElement("li");
  const formattedTime = formatTime(msgObj.timestamp || Date.now());

  if (msgObj.username === username) {
    item.classList.add("my-message");
    item.innerHTML = `<strong>You:</strong> ${msgObj.text}
      <span class="time">${formattedTime}</span>`;
  } else if (msgObj.username === "System") {
    item.classList.add("system-message");
    item.innerHTML = `${msgObj.text}
      <span class="time">${formattedTime}</span>`;
  } else {
    item.classList.add("other-message");
    item.innerHTML = `<strong>${msgObj.username}:</strong> ${msgObj.text}
      <span class="time">${formattedTime}</span>`;
  }

  messages.appendChild(item);
  messages.lastElementChild?.scrollIntoView({ behavior: "smooth" });
});

// TYPING EVENTS
input.addEventListener("input", () => {
  socket.emit("typing", username);
});

socket.on("typing", (user) => {
  if (user !== username) {
    typingIndicator.innerText = `${user} is typing...`;
    typingIndicator.style.display = "block";

    setTimeout(() => {
      typingIndicator.style.display = "none";
    }, 2000);
  }
});
