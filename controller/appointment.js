import Appointment from "../model/appointment.js";
import User from "../model/users.js";

export default class AppointmentController {

    // Appointment registration
    static async createAppointment(req, res) {
        try {
            // check doctor
            const { doctorId, date, time } = req.body;
            const patientId = req.user.id;
            const { id } = req.params;


            const doctor = await User.findById(doctorId);
            if (!doctor || doctor.role !== "doctor") {
                return res.status(404).json({ message: "دکتر پیدا نشد." });
            }

            // prevent duplicate bookings
            const exists = await Appointment.findOne({
                doctorId,
                date,
                time,
                status: { $ne: "canceled" }
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
      
            // If request expects JSON (API/ajax), return JSON.
            if (req.headers.accept && req.headers.accept.includes("application/json")) {
                return res.status(201).json({
                    message: "نوبت ثبت شد.",
                    body: appointment
                });
            }

            return res.redirect('/appointments/view?booked=1');
      
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "خطای سرور"});
        }
    };

    // Patient appointments
    static async getPatientAppointments(req, res) {
        try {
            const patientId = req.user.id;
            let appointments = await Appointment.find({ patientId })
                .sort({ date: 1, time: 1 })
                .lean();

            appointments = await Promise.all(appointments.map(async (a) => {
                a.doctorId = await User.findById(a.doctorId).select('name email').lean();
                return a;
            }));

            res.json(appointments);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: "خطای سرور"});
        }
    }

    // Appointment cancellation by the patient
    static async cancelAppointment(req, res) {
        try{
            const appointmentId = req.params.id || req.params.appointmentId;
            const userId = req.user.id;
            const role = req.user.role;

            const appointment = await Appointment.findById(appointmentId);
            if (!appointment) {
                return res.status(404).json({ message: "نوبت پیدا نشد." });
            }

            // Allow cancellation by the patient who booked or the doctor assigned to the appointment
            if (role === 'patient') {
                if (appointment.patientId.toString() !== userId.toString()) {
                    return res.status(403).json({ message: "شما اجازه لغو این نوبت را ندارید." });
                }
            } else if (role === 'doctor') {
                if (appointment.doctorId.toString() !== userId.toString()) {
                    return res.status(403).json({ message: "شما اجازه لغو این نوبت را ندارید." });
                }
            } else {
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
                .sort({ createdAt: -1 })
                .lean();

            const patients = [];
            for (const a of appointments) {
                if (!a.patientId) continue;
                const patient = await User.findById(a.patientId).select('name email').lean();
                if (!patient) continue;
                const exists = patients.find((p) => p._id.toString() === patient._id.toString());
                if (!exists) patients.push(patient);
            }

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