export default function guest(req, res, next) {
  if (req.cookies.token) {
    return res.redirect("/appointments/view");
  }
  next();
}
