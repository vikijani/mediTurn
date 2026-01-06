import mongoose from "mongoose";

const approintmentSchema = new mongoose.Schema({
    patientId,
    doctorId,
    date,
    time,
    status: "pending" | "confirmed" | "canceled",
    userId
});

export default mongoose.model("Approintment", approintmentSchema)