import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    reservationId: {
      type: String,
      required: true,
      unique: true
    },
    partnerId: {
      type: String,
      required: true
    },
    seats: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed"
    }
  },
  { timestamps: true }
);

export const Reservation = mongoose.model(
  "Reservation",
  reservationSchema
);