const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("user joined", (username) => {
    socket.username = username;
    io.emit("chat message", {
      username: "System",
      text: `${username} joined the chat 👋`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  });

  socket.on("chat message", (msgObj) => {
    io.emit("chat message", msgObj);
  });

  socket.on("disconnect", () => {
    if (socket.username) {
      io.emit("chat message", {
        username: "System",
        text: `${socket.username} left the chat ❌`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }
    console.log("A user disconnected");
  });
});

server.listen(3000, () => {
  console.log("Chat server running at http://localhost:3000");
});
