const socket = io();
let username;

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

// Format time properly
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
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

joinBtn.addEventListener("click", () => {
  username = usernameInput.value.trim();
  if (!username) return;

  loginScreen.style.display = "none";
  chatScreen.style.display = "block";

  socket.emit("user joined", username);
});

// Load stored messages from DB when joining chat
socket.on("load messages", (oldMessages) => {
    oldMessages.forEach(renderMessage);
});

// Send new chat message
form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (input.value.trim()) {
        socket.emit("chat message", {
            username,
            text: input.value,
            timestamp: Date.now()
        });
        input.value = "";
    }
});

// Receive and show message
socket.on("chat message", renderMessage);

// Function to add message to UI
function renderMessage(msgObj) {
    const li = document.createElement("li");
    const time = formatTime(msgObj.timestamp);

    if (msgObj.username === "System") {
        li.classList.add("system-message");
        li.innerHTML = `${msgObj.text} <span class="time">${time}</span>`;
    }
    else if (msgObj.username === username) {
        li.classList.add("my-message");
        li.innerHTML = `<strong>You:</strong> ${msgObj.text} <span class="time">${time}</span>`;
    }
    else {
        li.classList.add("other-message");
        li.innerHTML = `<strong>${msgObj.username}:</strong> ${msgObj.text} <span class="time">${time}</span>`;
    }

    messages.appendChild(li);
    messages.lastElementChild?.scrollIntoView({ behavior: "smooth" });
}
