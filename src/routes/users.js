import e from "express";
import UserController from "../controller/users.js";

const router = e.Router();

router.get("/get-user", UserController.getAllUser);

router.post("/register", UserController.register);

router.post("/login", UserController.login);

export default router;