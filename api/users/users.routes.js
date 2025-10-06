// routes: /api/users
import express from "express";
const router = express.Router();

let users = [
  { id: 1, name: "Sample User", email: "sample@demo.com", role: "tenant" }
];

router.get("/", (req, res) => res.json(users));

router.get("/:id", (req, res) => {
  const user = users.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

router.post("/", (req, res) => {
  const { name, email, role } = req.body;
  const newUser = { id: users.length + 1, name, email, role };
  users.push(newUser);
  res.status(201).json(newUser);
});

export default router;
