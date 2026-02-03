import Appointment from "../model/appointment.js";
import User from "../model/users.js";

export default class AppointmentController {

    // Appointment registration
    static async createAppointment(req, res) {
        try {
            // check doctor
            const { doctorId, date, time } = req.body;
            const patientId = req.user.id;

            const doctor = await User.findById(doctorId);
            if (!doctor || doctor.role !== "doctor") {
                return res.status(404).json({ message: "دکتر پیدا نشد." });
            }

            // prevent duplicate bookings
            const exists = await Appointment.findOne({
                doctorId,
                date,
                time,
                status: { $en: "canceled" }
            });

            if (exists) {
                return res.status(400).json({ message: "این نوبت از قبل رزرو شده است." });
            }

            // create appointment
            const appointment = await Appointment.create({
                patientId,
                doctorId,
                date,
                time,
                status: "pending"
            });
      
            res.status(201).json({
                message: "نوبت ثبت شد.",
                body: appointment
            });
      
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "خطای سرور"});
        }
    };

    // Patient appointments
    static async getPatientAppointments(req, res) {
        try {
            const patientId = req.user.id;
            const appointments = await Appointment.find({ patientId })
                .populate("doctorId", "name email")
                .sort({ date: 1, time: 1 });
            res.json(appointments);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "خطای سرور"});
        }
    }

    // Appointment cancellation by the patient
    static async cancelAppointment(req, res) {
        try{
            const {appointmentId} = req.params;
            const patientId = req.user.id;

            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: "نوبت پیدا نشد." });
            }

            if (appointment.patientId.toString() !== patientId.toString()) {
                return res.status(403).json({ message: "شما اجازه لغو این نوبت را ندارید." });
            }

            appointment.status = "canceled";
            await appointment.save();

            res.json({ message: "نوبت لغو شد." });
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "خطای سرور"});
        }
    };

    // show patients for doctor

    static async getDoctorPatients(req, res) {
        try {
            const doctorId = req.user.id;
            const appointments = await Appointment.find({ doctorId })
                .populate("patientId", "name email")
                .sort({ createdAt: -1 });

            const patients = [];
            
            appointments.forEach(a => {
                const exists = patients.find(
                    (p) => p._id.toString() === a.patientId._id.toString()
                );
                if (!exists) patients.push(a.patientId)
            })
            res.json(patients);

        } catch (error) {
            console.error(error);
            res.status(500).json({message: "خطای سرور"});
        }
    }

    // get all doctors
    static async getAllDoctors(req, res) { 
        try {
            const doctors = await User.find({ role: "doctor" }).select("name phone");
            res.json({body: doctors, message: "لیست دکترها دریافت شد."});
        }catch (error) {   
            res.status(500).json({message: "خطای سرور"});
        }
    }
}