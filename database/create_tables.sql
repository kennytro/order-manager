CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SEQUENCE IF NOT EXISTS generic_id_seq; -- general purpose ID sequencer

-- SYSTEM DATA --
CREATE TABLE IF NOT EXISTS app_error
(
  level text NOT NULL,
  message text,
  metadata jsonb,
  created_date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS db_upgrade
(
  filepath text PRIMARY KEY,
  last_hash text,
  last_run_time timestamptz DEFAULT now()
);

-- APPLICATION DATA --
CREATE TABLE IF NOT EXISTS company_info
(
  key text PRIMARY KEY,
  value text NOT NULL
);

CREATE TABLE IF NOT EXISTS public_page_element
(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  sequence_number smallint NOT NULL,
  value text NULL,
  CONSTRAINT public_page_element_unique UNIQUE (name, sequence_number)
);

CREATE SEQUENCE IF NOT EXISTS delivery_route_id_seq MINVALUE 1000;
CREATE TABLE IF NOT EXISTS delivery_route
(
  id integer PRIMARY KEY DEFAULT nextval('delivery_route_id_seq'),
  name text NOT NULL UNIQUE,
  description text,
  driver_name text,
  driver_phone text
);

CREATE SEQUENCE IF NOT EXISTS client_id_seq MINVALUE 1000;
CREATE TABLE IF NOT EXISTS client
(
  id integer PRIMARY KEY DEFAULT nextval('client_id_seq'),
  name text NOT NULL,
  address_street text,
  address_city text,
  address_state text,
  address_zip text,
  phone text,
  email text,
  contact_person_name text,
  contact_person_phone text,
  contact_person_email text,
  contact_person_alt_name text,
  contact_person_alt_phone text,
  contact_person_alt_email text,
  fee_type fee_type DEFAULT 'Rate',
  fee_value numeric DEFAULT 0,
  fee_schedule fee_schedule DEFAULT 'None',
  show_public bool DEFAULT false,
  delivery_route_id text REFERENCES delivery_route,
  created_date timestamptz DEFAULT now()
);
ALTER SEQUENCE client_id_seq OWNED BY client.id;

CREATE SEQUENCE IF NOT EXISTS end_user_id_seq MINVALUE 1000;
CREATE TABLE IF NOT EXISTS end_user
(
  id integer PRIMARY KEY DEFAULT nextval('end_user_id_seq'),
  auth_id text NOT NULL,
  email text NOT NULL,
  email_verified bool NULL,
  role text NOT NULL DEFAULT 'customer',
  client_id integer REFERENCES client,
  settings jsonb,
  created_date timestamptz DEFAULT now()
);
ALTER SEQUENCE end_user_id_seq OWNED BY end_user.id;

CREATE SEQUENCE IF NOT EXISTS product_id_seq MINVALUE 1000;
CREATE TABLE IF NOT EXISTS product
(
  id integer PRIMARY KEY DEFAULT nextval('product_id_seq'),
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  category text,
  unit_price numeric DEFAULT 0,
  unit text,
  inventory_count integer,
  show_public bool DEFAULT false,
  is_available bool DEFAULT true,
  origin_country text DEFAULT 'USA',
  settings jsonb,
  created_date timestamptz DEFAULT now()
);
ALTER SEQUENCE product_id_seq OWNED BY product.id;

CREATE SEQUENCE IF NOT EXISTS statement_id_seq MINVALUE 10000;
CREATE TABLE IF NOT EXISTS statement_t
(
  id integer PRIMARY KEY DEFAULT nextval('statement_id_seq'),
  client_id integer REFERENCES client,
  statement_date date NOT NULL DEFAULT CURRENT_DATE, 
  subtotal_amount numeric DEFAULT 0,
  fee_amount numeric DEFAULT 0,
  adjust_amount numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  adjust_reason text,
  note text,
  settings jsonb,
  created_by integer REFERENCES end_user,
  created_at timestamptz DEFAULT now(),
  updated_by integer REFERENCES end_user,
  updated_at timestamptz DEFAULT now()
);
ALTER SEQUENCE statement_id_seq OWNED BY statement_t.id;

CREATE SEQUENCE IF NOT EXISTS order_id_seq MINVALUE 10000;
CREATE TABLE IF NOT EXISTS order_t
(
  id integer PRIMARY KEY DEFAULT nextval('order_id_seq'),
  client_id integer REFERENCES client,
  statement_id integer REFERENCES statement_t,
  status order_status DEFAULT 'Submitted',
  subtotal numeric DEFAULT 0,
  fee numeric DEFAULT 0,
  total_amount numeric DEFAULT 0,
  note text,
  created_by integer REFERENCES end_user,
  created_at timestamptz DEFAULT now(),
  updated_by integer REFERENCES end_user,
  updated_at timestamptz DEFAULT now()
);
ALTER SEQUENCE order_id_seq OWNED BY order_t.id;

CREATE TABLE IF NOT EXISTS order_item
(
  id integer PRIMARY KEY DEFAULT nextval('generic_id_seq'),
  order_id integer REFERENCES order_t,
  product_id integer REFERENCES product,
  quantity numeric DEFAULT 0,
  unit_price numeric DEFAULT 0,
  UNIQUE(order_id, product_id)
);

-- metric.level: 0 - child, 1 - parent, 2 - grandparent, etc.
CREATE TABLE IF NOT EXISTS metric
(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id uuid,
  level smallint DEFAULT 0,
  name text NOT NULL UNIQUE,
  description text,
  display_name text,
  short_name text,
  unit unit_of_measure,
  unit_label text DEFAULT '',
  aggregation_type metric_aggregation_type DEFAULT 'None',
  time_range metric_time_range_type DEFAULT 'None',
  model_name text,
  source_model_name text,
  ad_hoc bool DEFAULT false,
  filter_by_model_name text
);

CREATE TABLE IF NOT EXISTS metric_data
(
  id integer PRIMARY KEY DEFAULT nextval('generic_id_seq'),
  metric_id uuid NOT NULL REFERENCES metric,
  instance_id integer,
  value numeric,
  metric_date timestamptz DEFAULT now(),
  source_instance_id integer
);

CREATE TABLE IF NOT EXISTS message
(
  id integer PRIMARY KEY DEFAULT nextval('generic_id_seq'),
  message_type message_type DEFAULT 'Message',
  from_user text,
  to_user_id integer REFERENCES end_user,
  subject text,
  body text,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT 'infinity',
  is_read bool DEFAULT false
);
