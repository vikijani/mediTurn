export default class AppointmentView {
    static async renderPatientAppointments(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const total = await Appointment.countDocuments({
            patientId: req.user.id,
            status: { $ne: "canceled" }
        });

        const appointments = await Appointment.find({
            patientId: req.user.id,
            status: { $ne: "canceled" }
        })
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
    }


    static async renderAppointments(req, res) {
        const page = parseInt(req.query.page) || 1;
        const limit = 5;
        const skip = (page - 1) * limit;

        const total = await Appointment.countDocuments({
            status: "pending"
        });

        const appointments = await Appointment.find({
            status: "pending"
        })
            .populate("doctorId", "name")
            .sort({ date: 1, time: 1 })
            .limit(limit)
            .skip(skip);

        res.render("appointments", {
            appointments,
            user: req.user,
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        });
    }

}