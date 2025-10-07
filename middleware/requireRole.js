// middleware/requireRole.js — fixed
export function requireRole(roles) {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}

export function requireAnyRole(roles) {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user || !roles.some((r) => r === user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
    next();
  };
}
