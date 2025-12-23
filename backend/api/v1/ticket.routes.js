import express from "express";
import { cancelReservation, listReservations, reserveSeats } from "../../controllers/ticket.controller.js";

const router = express.Router();
router.get('/',(req,res)=>{
  res.send('Ticket Routes Working')
})
router.get('/reservations',listReservations);

router.post("/reservations", reserveSeats);
router.delete("/reservations/:reservationId",cancelReservation);

export default router;