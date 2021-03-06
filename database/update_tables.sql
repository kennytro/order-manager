ALTER TABLE order_t ADD COLUMN IF NOT EXISTS statement_id integer REFERENCES statement_t;
ALTER TABLE statement_t ADD COLUMN IF NOT EXISTS subtotal_amount numeric DEFAULT 0;
ALTER TABLE statement_t ADD COLUMN IF NOT EXISTS statement_date date NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE end_user ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'customer';
ALTER TABLE product ADD COLUMN IF NOT EXISTS origin_country text DEFAULT 'USA';
ALTER TABLE metric ADD COLUMN IF NOT EXISTS unit_label text DEFAULT '';
ALTER TABLE metric ADD COLUMN IF NOT EXISTS source_model_name text;
ALTER TABLE metric_data ADD COLUMN IF NOT EXISTS source_instance_id integer;
ALTER TABLE metric DROP COLUMN IF EXISTS group_by_key;
ALTER TABLE metric_data DROP COLUMN IF EXISTS group_by_key;
ALTER TABLE metric ADD COLUMN IF NOT EXISTS ad_hoc bool DEFAULT false;
ALTER TABLE metric ADD COLUMN IF NOT EXISTS filter_by_model_name text;
ALTER TABLE client ADD COLUMN IF NOT EXISTS fee_schedule fee_schedule DEFAULT 'None';
ALTER TABLE statement_t ADD COLUMN IF NOT EXISTS fee_amount numeric DEFAULT 0;
ALTER TABLE client ADD COLUMN IF NOT EXISTS settings jsonb;
ALTER TABLE order_t ADD COLUMN IF NOT EXISTS fee_explanation text;
ALTER TABLE order_t ADD COLUMN IF NOT EXISTS has_invoice bool DEFAULT false;
