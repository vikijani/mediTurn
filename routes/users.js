import e from "express";
import UserController from "../controller/users.js";

const router = e.Router();

router.get("/get-user", UserController.getAllUser);

router.post("/register", UserController.register);

router.post("/login", UserController.login);

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  return res.redirect("/login");
});


export default router;