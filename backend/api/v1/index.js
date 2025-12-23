import express from "express";
import ticketRoutes from "./ticket.routes.js";
import eventRoutes from "./event.routes.js";
export const indexRoute = express.Router();

indexRoute.use("/ticket", ticketRoutes);
indexRoute.use("/event", eventRoutes);