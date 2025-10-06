# Marketplace S0-T6 Starter Pack — Validation & Auth Integration

This package adds authentication and validation to the Marketplace API using **express-session**, **bcryptjs**, and **Joi**.

## ✅ Features
- Signup, Login, Logout, WhoAmI routes under `/api`
- Session-cookie authentication
- Password hashing with bcryptjs
- Joi-based validation middleware

## 📦 Installation
npm install bcryptjs joi express-session

## ⚙️ Usage
Mount the route in your main `server.js`:
import authRoutes from './routes/auth.js';
app.use('/api', authRoutes);

Run the server:
npm start

## 🧪 Test Endpoints
| Method | Endpoint | Expected |
|---------|-----------|----------|
| POST | /api/signup | Creates user → `{ success: true }` |
| POST | /api/login | Sets session → `{ success: true, user }` |
| GET | /api/_whoami | Returns logged-in user |
| POST | /api/logout | Ends session |
| Any invalid input | Returns `{ error: "Invalid input" }` |
