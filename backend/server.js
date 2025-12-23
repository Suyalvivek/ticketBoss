import express from "express";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { Event } from "./models/event.model.js";
import { indexRoute } from "./api/v1/index.js";
const app = express();
app.use(express.json());
app.use('/api/v1',indexRoute)
// 🔗 Connect to DB
await connectDB();
// Seed Event AFTER connection
const seedEvent = async () => {
  const exists = await Event.findOne({ eventId: "node-meetup-2025" });

  if (!exists) {
    await Event.create({
      eventId: "node-meetup-2025",
      name: "Node.js Meet-up",
      totalSeats: 500,
      availableSeats: 500,
      version: 0
    });
    console.log("🎟️ Event seeded");
  }
};

mongoose.connection.once("open", seedEvent);

// 🚀 Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});