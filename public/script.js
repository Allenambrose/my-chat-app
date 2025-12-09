const socket = io();
let username;

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

function formatExactTime(timestamp) {
  const time = new Date(timestamp);
  return time.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
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
  const showTime = formatExactTime(msgObj.timestamp);

  if (msgObj.username === "System") {
    item.classList.add("system-message");
    item.innerHTML = `${msgObj.text} <span class="time">${showTime}</span>`;
  } 
  else if (msgObj.username === username) {
    item.classList.add("my-message");
    item.innerHTML = `<strong>You:</strong> ${msgObj.text} <span class="time">${showTime}</span>`;
  } 
  else {
    item.classList.add("other-message");
    item.innerHTML = `<strong>${msgObj.username}:</strong> ${msgObj.text} <span class="time">${showTime}</span>`;
  }

  messages.appendChild(item);
  messages.lastElementChild?.scrollIntoView({ behavior: "smooth" });
});
