const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

let onlineUsers = {};

io.on("connection", (socket) => {
  socket.on("user joined", (username) => {
    onlineUsers[socket.id] = username;

    io.emit("chat message", {
      username: "System",
      text: `${username} joined the chat 👋`,
      timestamp: Date.now()
    });

    io.emit("users", Object.values(onlineUsers));
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("chat message", (msgObj) => {
    msgObj.timestamp = msgObj.timestamp || Date.now();
    io.emit("chat message", msgObj);
  });

  socket.on("disconnect", () => {
    const username = onlineUsers[socket.id];
    delete onlineUsers[socket.id];

    if (username) {
      io.emit("chat message", {
        username: "System",
        text: `${username} left the chat 👋`,
        timestamp: Date.now()
      });

      io.emit("users", Object.values(onlineUsers));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on live server port: ${PORT}`);
});
