const mongoose = require("mongoose")
mongoose.connect("mongodb+srv://sangeetaperagani8642:WPYL9BqV32VDDeXm@clusters.vna7u5e.mongodb.net/CodingLearning?retryWrites=true&w=majority&appName=ClusterS");
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