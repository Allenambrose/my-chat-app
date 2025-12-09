const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const { MongoClient } = require("mongodb");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static("public"));

// 🔗 MongoDB Atlas Connection String (YOUR OWN)
const uri = "mongodb+srv://allenambrose242_db_user:DVCGqcXjwInEhKXS@mychatdb.n3yxdki.mongodb.net/?appName=myChatDB";

const client = new MongoClient(uri);
let messagesCollection;

// 📌 Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    const db = client.db("myChatDB"); // database name
    messagesCollection = db.collection("messages"); // collection
    console.log("📌 Connected to MongoDB ✔");
  } catch (err) {
    console.error("❌ MongoDB Error:", err);
  }
}
connectDB();

// 📡 WebSocket Events
io.on("connection", async (socket) => {
  console.log("🟢 A user connected");

  // Load old messages from DB
  const previousMessages = await messagesCollection.find().toArray();
  socket.emit("load messages", previousMessages);

  socket.on("user joined", async (username) => {
    const msgObj = {
      username: "System",
      text: `${username} joined the chat 👋`,
      timestamp: Date.now()
    };

    await messagesCollection.insertOne(msgObj);
    io.emit("chat message", msgObj);
  });

  socket.on("chat message", async (msgObj) => {
    msgObj.timestamp = msgObj.timestamp || Date.now();
    await messagesCollection.insertOne(msgObj);
    io.emit("chat message", msgObj);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
