DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fee_type') THEN
    CREATE TYPE fee_type AS  ENUM ('Fixed', 'Rate');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fee_schedule') THEN
    CREATE TYPE fee_schedule as ENUM('None', 'Order', 'Statement');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS  ENUM ('Submitted', 'Processed', 'Shipped', 'Completed', 'Cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_of_measure') THEN
    CREATE TYPE unit_of_measure AS ENUM('Days', 'Number', 'Currency', 'Percent', 'Integer');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metric_aggregation_type') THEN
    CREATE TYPE metric_aggregation_type as ENUM('None', 'Sum', 'Product', 'Average');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'metric_time_range_type') THEN
    CREATE TYPE metric_time_range_type as ENUM('None', 'Daily', 'Monthly', 'Yearly');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_type') THEN
    CREATE TYPE message_type as ENUM('Message', 'Inquiry', 'Announcement', 'Memo', 'Notice', 'Alert');
  END IF;  
END$$;
