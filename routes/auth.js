import express from 'express';
import session from 'express-session';
import Joi from 'joi';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { validateBody } from '../middleware/validate.js';

const router = express.Router();

const users = [];

router.use(session({
  secret: process.env.SESSION_SECRET || 'change_me',
  resave: false,
  saveUninitialized: false,
}));

const signupSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

router.post('/signup', validateBody(signupSchema), async (req, res) => {
  const { name, email, password } = req.body;

  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already exists' });
  }

  const hashed = await hashPassword(password);
  const user = { id: users.length + 1, name, email, password: hashed };
  users.push(user);

  res.json({ success: true });
});

router.post('/login', validateBody(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Invalid email or password' });

  const match = await verifyPassword(password, user.password);
  if (!match) return res.status(400).json({ error: 'Invalid email or password' });

  req.session.user = { id: user.id, name: user.name, email: user.email };
  res.json({ success: true, user: req.session.user });
});

router.get('/_whoami', (req, res) => {
  res.json({ user: req.session.user || null });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

export default router;
