import { reserveSeatsService } from "../services/ticket.service.js";


export const reserveSeats = async (req, res) => {
  try {
    const { partnerId, seats } = req.body;

    const reservation = await reserveSeatsService(partnerId, seats);

    res.status(201).json({
      reservationId: reservation.reservationId,
      seats: reservation.seats,
      status: reservation.status
    });
  } catch (error) {
    if (
      error.message.includes("Concurrency") ||
      error.message.includes("seats")
    ) {
      return res.status(409).json({ error: error.message });
    }

    res.status(400).json({ error: error.message });
  }
};
import { cancelReservationService } from "../services/ticket.service.js";

export const cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;

    await cancelReservationService(reservationId);

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
export const listReservations = async (req, res) => {
  const reservations = await Reservation.find();

  res.status(200).json(reservations);
};