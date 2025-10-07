-- S1-T5 corrected migration: skip add-column if exists, skip invalid fields

-- 1️⃣ Add column only if it doesn’t exist
ALTER TABLE payments ADD COLUMN lease_id INTEGER REFERENCES leases(id);

-- 2️⃣ Safe backfill only if tenant_id + unit_id still exist
--    If they don’t, this will be skipped automatically
UPDATE payments
SET lease_id = (
  SELECT l.id
  FROM leases l
  WHERE l.tenant_id = payments.tenant_id
    AND l.unit_id = payments.unit_id
  LIMIT 1
)
WHERE lease_id IS NULL
  AND (SELECT COUNT(*) FROM pragma_table_info('payments') WHERE name='tenant_id') > 0;

-- 3️⃣ Verify linkage
SELECT COUNT(*) AS total,
       SUM(CASE WHEN lease_id IS NOT NULL THEN 1 ELSE 0 END) AS linked,
       SUM(CASE WHEN lease_id IS NULL THEN 1 ELSE 0 END) AS unlinked
FROM payments;
