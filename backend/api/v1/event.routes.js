import express from "express";
import { getEventSummary } from "../../controllers/event.controller.js";


const router = express.Router();

router.get("/summary", getEventSummary);

export default router;