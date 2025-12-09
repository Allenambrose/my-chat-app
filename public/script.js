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

  const sameDay = now.toDateString() === time.toDateString();

  if (sameDay) {
    return time.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  }

  return time.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
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
  if (input.value) {
    socket.emit("chat message", {
      username: username,
      text: input.value,
      timestamp: Date.now()
    });
    input.value = "";
  }
});

socket.on("chat message", (msgObj) => {
  const item = document.createElement("li");
  const formattedTime = formatTime(msgObj.timestamp);

  if (msgObj.username === "System") {
    item.classList.add("system-message");
    item.innerHTML = `${msgObj.text} <span class="time">${formattedTime}</span>`;
  } else if (msgObj.username === username) {
    item.classList.add("my-message");
    item.innerHTML = `<strong>You:</strong> ${msgObj.text}<span class="time">${formattedTime}</span>`;
  } else {
    item.classList.add("other-message");
    item.innerHTML = `<strong>${msgObj.username}:</strong> ${msgObj.text}<span class="time">${formattedTime}</span>`;
  }

  messages.appendChild(item);
  messages.lastElementChild?.scrollIntoView({ behavior: "smooth" });
});

// TYPING INDICATOR
input.addEventListener("input", () => {
  socket.emit("typing", username);
});

socket.on("typing", (user) => {
  if (user !== username) showTyping(user);
});

function showTyping(user) {
  let typingDiv = document.getElementById("typingIndicator");

  if (!typingDiv) {
    typingDiv = document.createElement("div");
    typingDiv.id = "typingIndicator";
    typingDiv.classList.add("typing");
    messages.appendChild(typingDiv);
  }

  typingDiv.textContent = `${user} is typing...`;

  clearTimeout(window.typingTimeout);
  window.typingTimeout = setTimeout(() => {
    typingDiv.remove();
  }, 1800);
}
