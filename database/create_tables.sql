-- CREATE TABLE IF NOT EXISTS end_user
--   (
--     id int PRIMARY KEY,
--     username text NULL,
--     password text NULL,
--     email text NOT NULL,
--     email_verified bool NULL,
--     verification_token text NULL,
--     realm text NULL,
--     settings jsonb
--   );

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
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

CREATE TABLE IF NOT EXISTS client
(
  id int PRIMARY KEY,
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
  created_date timestamptz DEFAULT now();
);
CREATE SEQUENCE IF NOT EXISTS client_sequencer
  MINIVALUE 1000
  OWNED BY client.id;
