-- 2025-10-08_seed_entities.sql
INSERT INTO properties (name, address, owner_id)
VALUES
('Sunset Apartments', '123 Main St', 5),
('Greenview Villas', '45 Pine Ave', 5);
INSERT INTO units (property_id, unit_number, rent_amount, status)
VALUES
(1, 'A1', 60000, 'Available'),
(1, 'A2', 65000, 'Available'),
(2, 'B1', 50000, 'Available');
INSERT INTO leases (unit_id, tenant_id, start_date, end_date, rent_cents, status)
VALUES
(1, 6, '2025-10-01', '2026-09-30', 60000, 'Active');
INSERT INTO payments (lease_id, amount_cents, method)
VALUES
(1, 60000, 'Bank Transfer');
