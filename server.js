const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

let users = {};
let seenStatus = {}; 

io.on("connection", (socket) => {

  socket.on("user joined", (username) => {
    users[socket.id] = username;

    io.emit("online users", Object.values(users));

    io.emit("chat message", {
      username: "System",
      text: `${username} joined the chat 👋`,
      timestamp: Date.now()
    });
  });

  socket.on("chat message", (msgObj) => {
    msgObj.timestamp = msgObj.timestamp || Date.now();
    io.emit("chat message", msgObj);

    Object.keys(users).forEach(id => {
      if (id !== socket.id) {
        seenStatus[id] = false;
      }
    });
  });

  socket.on("seen", (username) => {
    io.emit("seen update", username);
  });

  socket.on("clear chat", (username) => {
    if (username === "allen") {
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
      username: "System",
      text: `${name} left the chat ❌`,
      timestamp: Date.now()
    });
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
