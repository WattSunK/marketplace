-- S0-T5: Initial seed data
INSERT INTO users (name, email, role) VALUES
 ('Alice Tenant', 'alice@example.com', 'tenant'),
 ('Bob Landlord', 'bob@example.com', 'landlord');

INSERT INTO properties (name, address, landlord_id) VALUES
 ('Sunset Villa', '123 Sunshine Blvd', 2),
 ('Maple Apartments', '456 Elm Street', 2);

INSERT INTO leases (tenant_id, property_id, start_date, end_date, rent_amount) VALUES
 (1, 1, '2025-01-01', '2025-12-31', 90000);
