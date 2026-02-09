import Appointment from "../../model/appointment.js";
import User from "../../model/users.js";

export default class AppointmentViewController {

    static async renderPatientAppointments(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const skip = (page - 1) * limit;

            let query;
            let populateField;

            if (req.user.role === "doctor") {
                // For doctors: show appointments booked with this doctor (show patients)
                query = { doctorId: req.user.id, status: { $ne: "canceled" } };
                populateField = "patientId";
            } else {
                // For patients: show their appointments (show doctors)
                query = { patientId: req.user.id, status: { $ne: "canceled" } };
                populateField = "doctorId";
            }

            const total = await Appointment.countDocuments(query);

            let appointments = await Appointment.find(query)
                .sort({ date: 1, time: 1 })
                .limit(limit)
                .skip(skip)
                .lean();

            // Manually populate user name to avoid populate schema lookup issues
            appointments = await Promise.all(appointments.map(async (a) => {
                if (populateField === 'doctorId') {
                    a.doctorId = await User.findById(a.doctorId).select('name').lean();
                } else {
                    a.patientId = await User.findById(a.patientId).select('name').lean();
                }
                return a;
            }));

            res.render("my-appointments", {
                appointments,
                user: req.user,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                booked: req.query.booked || 0
            });

        } catch (error) {
            console.error(error);
            res.status(500).render("error", { message: "خطا در دریافت نوبت‌ها" });
        }
    }

    static async renderPendingAppointments(req, res) {
        try {
            if (req.user.role === "doctor") {
                const page = parseInt(req.query.page) || 1;
                const limit = 5;
                const skip = (page - 1) * limit;

                const query = { status: "pending", doctorId: req.user.id };

                const total = await Appointment.countDocuments(query);

                let appointments = await Appointment.find(query)
                    .sort({ date: 1, time: 1 })
                    .limit(limit)
                    .skip(skip)
                    .lean();

                // Manually populate doctor and patient names
                appointments = await Promise.all(appointments.map(async (a) => {
                    const doc = await User.findById(a.doctorId).select('name').lean();
                    const pat = await User.findById(a.patientId).select('name').lean();
                    a.doctorId = doc || { name: '—' };
                    a.patientId = pat || { name: '—' };
                    return a;
                }));

                res.render("appointments", {
                    appointments,
                    user: req.user,
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    booked: req.query.booked || 0
                });
            } else {
                // For patients, show doctors to book
                const doctors = await User.find({ role: "doctor" }).select("name phone");
                res.render("appointments", {
                    doctors,
                    user: req.user,
                    booked: req.query.booked || 0
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).render("error", { message: "خطا در دریافت نوبت‌ها" });
        }
    }

    static async confirmAppointment(req, res) {
        try {
            await Appointment.findByIdAndUpdate(req.params.id, {
                status: "confirmed"
            });

            res.redirect("back");
        } catch (error) {
            console.error(error);
            res.status(500).render("error", { message: "خطا در تایید نوبت" });
        }
    }

    static async cancelAppointment(req, res) {
        try {
            await Appointment.findByIdAndUpdate(req.params.id, {
                status: "canceled"
            });

            res.redirect("/my-appointments");
        } catch (error) {
            console.error(error);
            res.status(500).render("error", { message: "خطا در لغو نوبت" });
        }
    }
}
