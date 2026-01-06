import dotenv from "dotenv";
dotenv.config();

import express from "express";

import connectDB from "./src/config/database.js";
import user from "./src/routes/users.js";

const app = express();

connectDB();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

app.use(express.json());

app.use(user);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});