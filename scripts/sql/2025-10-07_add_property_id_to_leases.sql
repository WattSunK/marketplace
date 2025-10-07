-- ===============================================
-- Migration: Add property_id to leases
-- Date: 2025-10-07
-- ===============================================

PRAGMA foreign_keys = OFF;

ALTER TABLE leases ADD COLUMN property_id INTEGER REFERENCES properties(id);

UPDATE leases
SET property_id = (
  SELECT u.property_id FROM units u WHERE u.id = leases.unit_id
)
WHERE property_id IS NULL;

PRAGMA foreign_keys = ON;

-- Verification
SELECT id, unit_id, property_id FROM leases LIMIT 10;
