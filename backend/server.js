import express from "express";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { Event } from "./models/event.model.js";
import { indexRoute } from "./api/v1/index.js";

const app = express();
app.use(express.json());

console.log("Starting server...");

// Seed Event function
const seedEvent = async () => {
  try {
    const exists = await Event.findOne({ eventId: "node-meetup-2025" });

    if (!exists) {
      await Event.create({
        eventId: "node-meetup-2025",
        name: "Node.js Meet-up",
        totalSeats: 500,
        availableSeats: 500,
        version: 0
      });
      console.log("Event seeded successfully");
    } else {
      console.log("Event already exists");
    }
  } catch (error) {
    console.error("Error seeding event:", error.message);
  }
};


const startServer = async () => {
  try {
    // Connect to database 
    await connectDB();


    // Seed the event
    await seedEvent();

    app.use('/api/v1', indexRoute);

     //health check route
    app.get('/', (req, res) => {
      res.json({ 
        message: "TicketBoss API is running",
        status: "healthy",
        database: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
      });
    });

    // 5. Start the server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);

    });

  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

// Start everything
startServer();