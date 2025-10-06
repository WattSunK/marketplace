// routes: /api/properties
import express from "express";
const router = express.Router();

let properties = [
  { id: 1, name: "Sample Apartment", address: "123 Demo Street" }
];

router.get("/", (req, res) => res.json(properties));

router.get("/:id", (req, res) => {
  const property = properties.find(p => p.id === Number(req.params.id));
  if (!property) return res.status(404).json({ error: "Property not found" });
  res.json(property);
});

export default router;
