-- S1-T5: Add lease_id to payments and backfill via tenant/unit matching
ALTER TABLE payments ADD COLUMN lease_id INTEGER REFERENCES leases(id);

UPDATE payments
SET lease_id = (
  SELECT l.id
  FROM leases l
  WHERE l.tenant_id = payments.tenant_id
    AND l.unit_id = payments.unit_id
  LIMIT 1
)
WHERE lease_id IS NULL;

-- Verification queries
SELECT COUNT(*) AS total, 
       SUM(CASE WHEN lease_id IS NOT NULL THEN 1 ELSE 0 END) AS linked,
       SUM(CASE WHEN lease_id IS NULL THEN 1 ELSE 0 END) AS unlinked
FROM payments;
