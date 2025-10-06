# 🧬 S0-T8 — Persistent Users in SQLite

**Tenant–Landlord Marketplace**
**Phase:** Sprint 0 Task 8 (S0-T8)
**Status:** 🔜 Ready to Start
**Date:** 2025-10-06

---

## 🌟 Objective

Transition from **in-memory user storage** to a **persistent SQLite-backed users table** in `marketplace.dev.db`.
This ensures users, credentials, and roles are **retained across server restarts**, unifying session persistence (from S0-T7) with persistent identity data.

---

## 🧱 Scope

| Component               | Description                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Database Migration**  | Create `users` table in `data/dev/marketplace.dev.db` with `id`, `name`, `email`, `password_hash`, `role`, and timestamps. |
| **Auth Logic Update**   | Modify `/api/signup` and `/api/login` routes in `routes/auth.js` to use SQLite instead of in-memory array.                 |
| **Password Hashing**    | Continue using `bcryptjs` for password storage and verification.                                                           |
| **Validation**          | Retain `Joi` schemas for input validation and extend for uniqueness checks (email).                                        |
| **Error Handling**      | Standardize JSON error responses for duplicate users, invalid credentials, or DB failures.                                 |
| **Session Integration** | Persist only `user.id`, `user.email`, and `user.role` in `req.session.user`.  DB remains the source of truth.              |
| **Verification Script** | Extend `scripts/verify_session_flow.bat` to confirm user persistence after server restart.                                 |

---

## 🤩 Database Design

### Table: `users`

| Field           | Type     | Constraints                                                    |
| --------------- | -------- | -------------------------------------------------------------- |
| `id`            | INTEGER  | PRIMARY KEY AUTOINCREMENT                                      |
| `name`          | TEXT     | NOT NULL                                                       |
| `email`         | TEXT     | UNIQUE, NOT NULL                                               |
| `password_hash` | TEXT     | NOT NULL                                                       |
| `role`          | TEXT     | CHECK(role IN ('admin','landlord','tenant')), DEFAULT 'tenant' |
| `created_at`    | DATETIME | DEFAULT CURRENT_TIMESTAMP                                      |
| `updated_at`    | DATETIME | DEFAULT CURRENT_TIMESTAMP                                      |

---

## ⚙️ Implementation Plan

### 1️⃣ Migration Script

Create `/scripts/sql/2025-10-06_add_users_table.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT CHECK(role IN ('admin','landlord','tenant')) DEFAULT 'tenant',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2️⃣ Update `/routes/auth.js`

* Replace the in-memory `users` array with DB queries using `sqlite`.
* Use `INSERT` for signup and `SELECT` + bcrypt comparison for login.
* Keep `/api/_whoami` and `/api/logout` unchanged (session-based).

### 3️⃣ Integration

* Ensure `db.js` exports a reusable connection (`import { db } from "../db.js"`).
* Wrap all DB operations in try/catch blocks.
* Normalize responses:

  ```json
  { "success": false, "error": "Email already registered" }
  ```

### 4️⃣ Testing

* Run migration.
* Signup → Login → Whoami → Reboot → Whoami again.
* Confirm persistence in DB:

  ```bash
  sqlite3 data/dev/marketplace.dev.db "SELECT id,email,role FROM users;"
  ```

---

## 🧠 Dependencies

Already satisfied from S0-T7:

* `sqlite`
* `sqlite3`
* `better-sqlite3`
* `bcryptjs`
* `joi`
* `dotenv`

No new packages required for this increment.

---

## 🤮 Verification Flow

1️⃣ Apply migration:

```bash
sqlite3 data/dev/marketplace.dev.db < scripts/sql/2025-10-06_add_users_table.sql
```

2️⃣ Run server:

```bash
sudo node server.js
```

3️⃣ Signup → Login → Check persistence:

```bash
curl -s -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"mainakamunyu@gmail.com","password":"pass123","role":"admin"}' \
  http://127.0.0.1:3101/api/signup | jq .

curl -s -c session.txt -H "Content-Type: application/json" \
  -d '{"email":"mainakamunyu@gmail.com","password":"pass123"}' \
  http://127.0.0.1:3101/api/login | jq .

curl -s -b session.txt http://127.0.0.1:3101/api/_whoami | jq .
```

4️⃣ Confirm database persistence:

```bash
sqlite3 data/dev/marketplace.dev.db "SELECT id,name,email,role FROM users;"
```

---

## ✅ Definition of Done (DoD)

* [ ] `users` table created and accessible
* [ ] `/api/signup` inserts new users into DB
* [ ] `/api/login` authenticates against stored hash
* [ ] Sessions store only reference data (id/email/role)
* [ ] Duplicate signup handled gracefully
* [ ] Verified via curl after reboot
* [ ] Tagged: `S0-T8-complete` and `S0-T8-verified-NAS`

---

## 🗆 Deliverables

| File                                               | Description                      |
| -------------------------------------------------- | -------------------------------- |
| `/scripts/sql/2025-10-06_add_users_table.sql`      | Migration script                 |
| `/routes/auth.js`                                  | Updated persistent user logic    |
| `/db.js`                                           | Reusable DB connection           |
| `/scripts/verify_session_flow.bat`                 | Extended persistence test        |
| `/docs/S0-T8_Persistent_Users_in_SQLite_README.md` | Final verification documentation |

---

### 🏁 Summary

S0-T8 will replace in-memory user storage with a **database-backed identity layer** that integrates directly with the persistent session system from S0-T7.
This completes the foundation for a full authentication system with durable users, paving the way for **JWT, OAuth, and multi-role dashboard access** in later sprints.
