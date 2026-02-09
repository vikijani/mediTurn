import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/database.js";

// routes
import userRoutes from "./routes/users.js";
import appointmentRoutes from "./routes/appointment.js";

// middlewares
import auth from "./middleware/auth.js";
import guest from "./middleware/guest.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// DB
connectDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

// static files
app.use(express.static("public"));

app.get("/", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect("/login");
  }
  return res.redirect("/appointments");
});

app.get("/login", guest, (req, res) => {
  res.render("login");
});

app.get("/register", guest, (req, res) => {
  res.render("register");
});

app.use(userRoutes);
app.use(appointmentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`✅ Server running on port ${process.env.PORT}`);
});
