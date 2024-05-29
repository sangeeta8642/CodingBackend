const mongoose = require("mongoose")
mongoose.connect("mongodb://127.0.0.1:27017/CodingLearning")

const db = mongoose.connection;

db.on("error", (error) => {
  console.warn("MongoDB connection error:", error);
});

db.once("open", () => {
  console.log("Connected to MongoDB:");
});

// Handle disconnects
db.on("disconnected", () => {
  console.warn("MongoDB disconnected");
});

// Close the MongoDB connection when the Node process is terminated
process.on("SIGINT", () => {
  db.close(() => {
    console.log("MongoDB connection closed through app termination");
    process.exit(0);
  });
});