# Light Integration Strategy
*(Condo section updated – 08 Oct 2025)*

## Overview
The Light Integration Strategy defines how the Tenant–Landlord Marketplace introduces lightweight, decoupled integrations during early implementation phases.

---

### 🔹 Kill Bill
Enterprise-grade billing engine integrated via REST API in Phase S2-T0.
Supports invoice generation, reconciliation, and account management.

### 🔹 Cocorico
Reference for marketplace-style listings and service flows; retained for conceptual mapping only.
No code or deployment dependency.

### 🔹 Condo (Conceptual Reference)
No longer a live container or external sync.  
The **S2-T4 Maintenance Module** re-implements Condo’s ticketing and unit-management logic natively inside the Marketplace (Node.js + PostgreSQL), preserving its workflow without adding external dependencies.

### 🔹 Wattsun Reuse Pack
Shared logic and reusable integration patterns (inventory, order, notification) across projects.
