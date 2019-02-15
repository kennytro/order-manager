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

CREATE TABLE IF NOT EXISTS client
(
  id int PRIMARY KEY,
  name text NOT NULL,
  address_street text,
  address_city text,
  address_state text,
  address_zip text
);
CREATE SEQUENCE IF NOT EXISTS client_sequencer
  MINIVALUE 1000
  OWNED BY client.id;
