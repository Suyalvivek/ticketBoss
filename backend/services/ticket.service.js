
import { Event } from "../models/event.model.js";
import { Reservation } from "../models/reservation.model.js";
import crypto from "crypto";

export const reserveSeatsService = async (partnerId, seats) => {
  if (seats <= 0 || seats > 10) {
    throw new Error("Invalid seat count");
  }

  // Always fetch latest event
  const event = await Event.findOne({ eventId: "node-meetup-2025" });

  if (!event) {
    throw new Error("Event not found");
  }

  // 🔐 Optimistic Concurrency Control
  const updatedEvent = await Event.findOneAndUpdate(
    {
      eventId: "node-meetup-2025",
      availableSeats: { $gte: seats },
      version: event.version
    },
    {
      $inc: {
        availableSeats: -seats,
        version: 1
      }
    },
    { new: true }
  );

  if (!updatedEvent) {
    throw new Error("Concurrency conflict or insufficient seats");
  }

  const reservation = await Reservation.create({
    reservationId: crypto.randomUUID(),
    partnerId,
    seats
  });

  return reservation;
};
export const cancelReservationService = async (reservationId) => {
  const reservation = await Reservation.findOne({ reservationId });

  if (!reservation || reservation.status === "cancelled") {
    throw new Error("Reservation not found");
  }

  const event = await Event.findOne({ eventId: "node-meetup-2025" });

  if (!event) {
    throw new Error("Event not found");
  }

  // Return seats back (optimistic update)
  const updatedEvent = await Event.findOneAndUpdate(
    {
      eventId: "node-meetup-2025",
      version: event.version
    },
    {
      $inc: {
        availableSeats: reservation.seats,
        version: 1
      }
    },
    { new: true }
  );

  if (!updatedEvent) {
    throw new Error("Concurrency conflict");
  }

  reservation.status = "cancelled";
  await reservation.save();
};