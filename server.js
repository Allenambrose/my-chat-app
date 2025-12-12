require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// Serve frontend
app.use(express.static("public"));

// ---------------------------
// CONNECT TO MONGO
// ---------------------------
let messagesCollection;

async function connectDB() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    const client = new MongoClient(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    await client.connect();

    const db = client.db("myChatDB");
    messagesCollection = db.collection("messages");

    console.log("📌 Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
}

connectDB();

// ---------------------------
// ONLINE USERS
// ---------------------------
let onlineUsers = 0;

// ---------------------------
// SOCKET LOGIC
// ---------------------------
io.on("connection", async (socket) => {
  onlineUsers++;
  io.emit("usersOnline", onlineUsers);

  // Send chat history
  try {
    const history = await messagesCollection
      .find({})
      .sort({ timestamp: 1 })
      .toArray();

    socket.emit("chatHistory", history);
  } catch (err) {
    console.error("❌ History Fetch Error:", err);
  }

  // When user joins
  socket.on("join", async (username) => {
    socket.data.username = username;

    const joinMsg = {
      username: "System",
      text: `${username} joined 👋`,
      timestamp: Date.now(),
    };

    io.emit("message", joinMsg);
    await messagesCollection.insertOne(joinMsg);
  });

  // When user sends message
  socket.on("message", async (msg) => {
    msg.timestamp = Date.now();

    const result = await messagesCollection.insertOne(msg);
    msg._id = result.insertedId;

    io.emit("message", msg);
  });

  // Delete message
  socket.on("deleteMessage", async (id) => {
    try {
      await messagesCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { text: "(message deleted)" } }
      );

      io.emit("messageDeleted", id);
    } catch (err) {
      console.error("❌ Delete Error:", err);
    }
  });

  // ADMIN CLEAR CHAT
socket.on("clearChat", async () => {
  try {
    await messagesCollection.deleteMany({});
    io.emit("chatCleared"); // notify all clients
    console.log("🗑️ Chat cleared by admin");
  } catch (err) {
    console.error("❌ Clear chat error:", err);
  }
});


  // Typing
  socket.on("typing", () => {
    socket.broadcast.emit("typing", socket.data.username);
  });

  // Disconnect
  socket.on("disconnect", () => {
    onlineUsers--;
    io.emit("usersOnline", onlineUsers);
  });
});

// ---------------------------
// START SERVER
// ---------------------------
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
