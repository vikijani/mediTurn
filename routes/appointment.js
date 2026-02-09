import AppointmentController from "../controller/appointment.js";
import express from "express";
import AppointmentView from "../controller/view/appointment.view.js";

const router = express.Router();

router.post("/appointments", AppointmentController.createAppointment);

router.get("/appointments", AppointmentController.getPatientAppointments);

router.get("/appointments/doctor", AppointmentController.getAllDoctors);

router.get("/appointments/doctor/patients", AppointmentController.getDoctorPatients);

router.post("/appointments/:id/cancel", AppointmentController.cancelAppointment);

router.get("/appointments/view", AppointmentView.renderPendingAppointments);

router.get("/my-appointments", AppointmentView.renderPatientAppointments);

export default router;