// basic request validator middleware
export function validateRequest(requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter(f => !req.body[f]);
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }
    next();
  };
}
