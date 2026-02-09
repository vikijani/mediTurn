import AppointmentController from "../controller/appointment.js";
import express from "express";
import AppointmentView from "../controller/view/appointment.view.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/appointments", auth, AppointmentController.createAppointment);

router.get("/appointments", auth, AppointmentController.getPatientAppointments);

router.get("/appointments/doctor", auth, AppointmentController.getAllDoctors);

router.get("/appointments/doctor/patients", auth, AppointmentController.getDoctorPatients);

router.post("/appointments/:id/cancel", auth, AppointmentController.cancelAppointment);

router.get("/appointments/view", auth, AppointmentView.renderPendingAppointments);

router.get("/my-appointments", auth, AppointmentView.renderPatientAppointments);

router.post("/appointments/:id/confirm", auth, AppointmentView.confirmAppointment);

router.post("/appointments/:id/cancel", auth, AppointmentView.cancelAppointment);

export default router;