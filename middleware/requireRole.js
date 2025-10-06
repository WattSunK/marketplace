export function requireRole(role) {
  return (req, res, next) => {
    if (!req.session?.user)
      return res.status(401).json({ success: false, message: "Not logged in" });
    if (req.session.user.role !== role)
      return res.status(403).json({ success: false, message: "Forbidden" });
    next();
  };
}
