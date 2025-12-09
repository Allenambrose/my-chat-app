const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { MongoClient } = require("mongodb");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

// MongoDB Connection
const uri = "mongodb+srv://allenambrose242_db_user:DVCGqcXjwInEhKXS@mychatdb.n3yxdki.mongodb.net/?appName=myChatDB";
const client = new MongoClient(uri);
let messagesCollection;
let onlineUsers = 0;

async function connectDB() {
  await client.connect();
  const db = client.db("chatDB");
  messagesCollection = db.collection("messages");
  console.log("📌 Connected to MongoDB");
}
connectDB();

io.on("connection", async (socket) => {
  onlineUsers++;
  io.emit("online users", onlineUsers);

  // Send chat history from DB
  const storedMessages = await messagesCollection.find().toArray();
  socket.emit("chat history", storedMessages);

  socket.on("user joined", async (username) => {
    const msgObj = { username, text: `${username} joined the chat 👋`, timestamp: Date.now(), system: true };
    await messagesCollection.insertOne(msgObj);
    io.emit("chat message", msgObj);
  });

  socket.on("chat message", async (msgObj) => {
    msgObj.timestamp = Date.now();
    await messagesCollection.insertOne(msgObj);
    io.emit("chat message", msgObj);
  });

  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("online users", onlineUsers);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
