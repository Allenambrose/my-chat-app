const socket = io();
let username;

const loginScreen = document.getElementById("loginScreen");
const chatScreen = document.getElementById("chatScreen");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");

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
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    socket.emit("chat message", {
      username: username,
      text: input.value,
      time: time,
    });

    input.value = "";
  }
});

socket.on("chat message", (msgObj) => {
  const item = document.createElement("li");

  if (msgObj.username === "System") {
    item.classList.add("system-message");
    item.innerHTML = `${msgObj.text} 
    <span class="time">${msgObj.time}</span>`;
  }
  else if (msgObj.username === username) {
    item.classList.add("my-message");
    item.innerHTML = `<strong>You:</strong> ${msgObj.text}
    <span class="time">${msgObj.time}</span>`;
  }
  else {
    item.classList.add("other-message");
    item.innerHTML = `<strong>${msgObj.username}:</strong> ${msgObj.text}
    <span class="time">${msgObj.time}</span>`;
  }

  messages.appendChild(item);
  messages.lastElementChild?.scrollIntoView({ behavior: "smooth" });
});
