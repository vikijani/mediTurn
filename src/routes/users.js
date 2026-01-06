import e from "express";
import UserController from "../controller/users.js";

const router = e.Router();

router.get("/get-user", UserController.getAllUser);

router.post("/register", UserController.register);

export default router;