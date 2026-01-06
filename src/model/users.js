import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    role: { type: String, enum: ["patient", "doctor"], default: "patient" },
    name: { type: String, required: true },
    phone: { type: Number, required: true },
    passwordHash: { type: String, required: true },
    userId: { type: String, required: true, unique: true, index: true },
});

export default mongoose.model("Users", userSchema);