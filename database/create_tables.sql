CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE SEQUENCE IF NOT EXISTS generic_id_seq; -- general purpose ID sequencer

CREATE TABLE IF NOT EXISTS app_error
(
  level text NOT NULL,
  message text,
  metadata jsonb,
  created_date timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public_page_element
(
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  sequence_number smallint NOT NULL,
  value text NULL,
  CONSTRAINT public_page_element_unique UNIQUE (name, sequence_number)
);

CREATE TABLE IF NOT EXISTS delivery_route
(
  id text PRIMARY KEY,
  description text,
  driver_name text,
  driver_phone text
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'fee_type') THEN
      CREATE TYPE fee_type AS  ENUM ('Fixed', 'Rate');
  END IF;
END$$;

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
  settings jsonb,
  created_date timestamptz DEFAULT now()
);
ALTER SEQUENCE product_id_seq OWNED BY product.id;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
      CREATE TYPE order_status AS  ENUM ('Submitted', 'Processed', 'Completed', 'Cancelled');
  END IF;
END$$;

CREATE SEQUENCE IF NOT EXISTS order_id_seq MINVALUE 10000;
CREATE TABLE IF NOT EXISTS order_t
(
  id integer PRIMARY KEY DEFAULT nextval('order_id_seq'),
  client_id integer REFERENCES client,
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