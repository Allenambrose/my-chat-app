const express = require("express");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

io.on("connection", (socket) => {

  socket.on("user joined", (username) => {
    io.emit("chat message", {
      username: "System",
      text: `${username} joined the chat 👋`,
      timestamp: Date.now()
    });
  });

  socket.on("chat message", (msgObj) => {
    msgObj.timestamp = msgObj.timestamp || Date.now();
    io.emit("chat message", msgObj);
  });

  // Typing Indicator
  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
