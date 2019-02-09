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
