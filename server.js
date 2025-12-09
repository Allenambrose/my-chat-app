const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { MongoClient } = require("mongodb");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  await client.connect();
  db = client.db("myChatDB").collection("messages");
  console.log("📌 Connected to MongoDB");
}
connectDB();

let onlineUsers = 0;

io.on("connection", (socket) => {
  onlineUsers++;
  io.emit("usersOnline", onlineUsers);

  socket.on("join", async (username) => {
    const joinMsg = {
      username: "System",
      text: `${username} joined 👋`,
      timestamp: Date.now()
    };
    io.emit("message", joinMsg);
    await db.insertOne(joinMsg);
  });

  socket.on("message", async (msg) => {
    await db.insertOne(msg);
    io.emit("message", msg);
  });

  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("usersOnline", onlineUsers);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
