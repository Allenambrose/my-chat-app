const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

let users = {};
let messages = []; // store messages with id

io.on("connection", (socket) => {

  socket.on("user joined", (username) => {
    users[socket.id] = username;

    io.emit("online users", Object.values(users));

    io.emit("chat message", {
      id: Date.now().toString(),
      username: "System",
      text: `${username} joined the chat 👋`,
      timestamp: Date.now()
    });
  });

  // Receive message
  socket.on("chat message", (msgObj) => {
    msgObj.id = Date.now().toString();
    messages.push(msgObj);
    io.emit("chat message", msgObj);
  });

  // Long press delete
  socket.on("delete message", ({ id, user }) => {
    const msg = messages.find(m => m.id === id);
    if (!msg) return;

    // Only admin OR sender can delete
    if (user === "allen" || user === msg.username) {
      io.emit("message deleted", id);

      // update stored copy
      msg.text = "This message was deleted";
      msg.deleted = true;
    }
  });

  // Seen update
  socket.on("seen", (username) => {
    io.emit("seen update", username);
  });

  // Clear chat (admin only)
  socket.on("clear chat", (username) => {
    if (username === "allen") {
      messages = [];
      io.emit("clear chat now");
    }
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("disconnect", () => {
    const name = users[socket.id];
    delete users[socket.id];
    io.emit("online users", Object.values(users));

    io.emit("chat message", {
      id: Date.now().toString(),
      username: "System",
      text: `${name} left the chat ❌`,
      timestamp: Date.now()
    });
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
