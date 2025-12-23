import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true
    },
    name: String,
    totalSeats: Number,
    availableSeats: Number,
    version: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);