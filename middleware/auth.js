import jwt from "jsonwebtoken";
import Users from "../model/users.js";

export default async function auth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.redirect("/login");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Users
      .findById(decoded.id)
      .select("-passwordHash");

    if (!user) {
      return res.redirect("/login");
    }

    req.user = user;
    next();
  } catch (err) {
    return res.redirect("/login");
  }
}
