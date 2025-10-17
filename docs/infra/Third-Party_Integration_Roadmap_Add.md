# Third-Party Integration Roadmap
*(Condo section updated – 08 Oct 2025)*

## Phase Overview

| Phase | Integration | Description |
|--------|--------------|--------------|
| **S1-T7** | Light Integrations | Integration scaffolds and registry initialization. |
| **S2-T0** | Kill Bill Integration | PostgreSQL migration and billing container deployment. |
| **S2-T1** | Kill Bill REST Bridge | `/api/billing/*` connectors linking invoices and reconciliation. |
| **S2-T4** | Maintenance Module (Condo-Inspired) | Implemented natively – see below. |
| **S3-T2** | Cocorico External Bridge | Future integration for public property listings. |

---

### 🔹 **Phase S2-T4 – Maintenance Module (Condo-Inspired)**
| Area | Description |
|------|--------------|
| **Objective** | Implement a native maintenance and service-request system modeled after Condo workflows. |
| **APIs Mapped** | `/api/maintenance`, `/api/hooks/notify`, optional billing link via `/api/billing/*`. |
| **Data Flow** | Tenant creates maintenance ticket → Admin assigns and tracks progress → optional cost linkage to billing. |
| **Dependencies** | PostgreSQL migration (S2-T0), Integration Layer (S1-T7). |
| **Deliverables** | `maintenance_tickets` table, CRUD routes, admin UI partial, optional billing hook. |
| **Note** | Condo is retained only as a **conceptual reference**; no code, container, or sync is used. All maintenance logic lives in-house within the Marketplace backend. |
