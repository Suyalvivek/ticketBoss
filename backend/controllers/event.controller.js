import { Event } from "../models/event.model.js";
import { Reservation } from "../models/reservation.model.js";

export const getEventSummary = async (req, res) => {
  try {
    const event = await Event.findOne({ eventId: "node-meetup-2025" });

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Calculate total seats booked (sum of all confirmed reservations)
    // Much more efficient: totalSeats - availableSeats
    const reservationCount = event.totalSeats - event.availableSeats;

    res.status(200).json({
      eventId: event.eventId,
      name: event.name,
      totalSeats: event.totalSeats,
      availableSeats: event.availableSeats,
      reservationCount: reservationCount,
      version: event.version
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};