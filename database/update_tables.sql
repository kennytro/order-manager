ALTER TABLE order_t ADD COLUMN IF NOT EXISTS statement_id integer REFERENCES statement_t;
