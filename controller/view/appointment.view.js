import Appointment from "../../model/appointment.js";

export default class AppointmentViewController {

    static async renderPatientAppointments(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const skip = (page - 1) * limit;

            const query = {
                patientId: req.user.id,
                status: { $ne: "canceled" }
            };

            const total = await Appointment.countDocuments(query);

            const appointments = await Appointment.find(query)
                .populate("doctorId", "name")
                .sort({ date: 1, time: 1 })
                .limit(limit)
                .skip(skip);

            res.render("my-appointments", {
                appointments,
                user: req.user,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            });

        } catch (error) {
            console.error(error);
            res.status(500).render("error", { message: "خطا در دریافت نوبت‌ها" });
        }
    }

    static async renderPendingAppointments(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = 5;
            const skip = (page - 1) * limit;

            const query = { status: "pending" };

            const total = await Appointment.countDocuments(query);

            const appointments = await Appointment.find(query)
                .populate("doctorId", "name")
                .populate("patientId", "name")
                .sort({ date: 1, time: 1 })
                .limit(limit)
                .skip(skip);

            res.render("appointments", {
                appointments,
                user: req.user,
                currentPage: page,
                totalPages: Math.ceil(total / limit)
            });

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

            res.redirect("back");
        } catch (error) {
            console.error(error);
            res.status(500).render("error", { message: "خطا در لغو نوبت" });
        }
    }
}
