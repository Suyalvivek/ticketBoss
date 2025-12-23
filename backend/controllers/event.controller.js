import { Event } from "../models/event.model.js";
import { Reservation } from "../models/reservation.model.js";



export const getEventSummary = async (req, res) => {
  const event = await Event.findOne({ eventId: "node-meetup-2025" });

  if (!event) {
    return res.status(404).json({ error: "Event not found" });
  }

  const reservationCount = await Reservation.countDocuments({
    status: "confirmed"
  });

  res.status(200).json({
    eventId: event.eventId,
    name: event.name,
    totalSeats: event.totalSeats,
    availableSeats: event.availableSeats,
    reservationCount,
    version: event.version
  });
};