ALTER TABLE order_t ADD COLUMN IF NOT EXISTS statement_id integer REFERENCES statement_t;
ALTER TABLE statement_t ADD COLUMN IF NOT EXISTS subtotal_amount numeric DEFAULT 0;
