import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/database.js";
import user from "./routes/users.js";
import appointment from "./routes/appointment.js";

const app = express();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

connectDB();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.use(cookieParser());

app.set("views", path.join(__dirname, "view"));

app.use(express.static("public"));

app.get("/my-appointments", (req, res) => {
  res.render("my-appointments", {
    appointments: [],
    user: { name: "تست" },
    currentPage: 1,
    totalPages: 1
  });
});

app.get("/appointments", (req, res) => {
  res.render("appointments", {
    appointments: [],
    user: { name: "تست" },
    currentPage: 1,
    totalPages: 1
  });
});

app.get("/login", (req, res) => {
  res.render("login", {
    appointments: [],
    user: { name: "تست" },
    currentPage: 1,
    totalPages: 1
  });
});

app.get("/register", (req, res) => {
  res.render("register", {
    appointments: [],
    user: { name: "تست" },
    currentPage: 1,
    totalPages: 1
  });
});

app.use(user);
app.use(appointment);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});