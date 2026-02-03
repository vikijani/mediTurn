import AppointmentController from "../controller/appointment.js";
import express from "express";

const router = express.Router();

router.post("/appointments", AppointmentController.createAppointment);

router.get("/appointments", AppointmentController.getPatientAppointments);

router.get("/appointments/doctor", AppointmentController.getAllDoctors);

router.get("/appointments/patient/", AppointmentController.getDoctorPatients);

router.delete("/appointments/:id/status", AppointmentController.cancelAppointment);

export default router;