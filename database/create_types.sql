DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fee_type') THEN
      CREATE TYPE fee_type AS  ENUM ('Fixed', 'Rate');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
      CREATE TYPE order_status AS  ENUM ('Submitted', 'Processed', 'Shipped', 'Completed', 'Cancelled');
  END IF;
END$$;
