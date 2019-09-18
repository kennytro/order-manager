-- create public page templates
TRUNCATE TABLE public_page_element;
INSERT INTO public_page_element (name, sequence_number, value) 
VALUES
  ('home', 0, '<div><h1>Home Title</h1></dev>'),
  ('home', 1, '<div><p>Company introduction goes here</p></dev>'),
  ('client', 0, '<div><h1>Client Title</h1></dev>'),
  ('client', 1, '<div><p>Client list name goes here<p></dev>'),
  ('product', 0, '<div><h1>Product Title</h1></dev>'),
  ('product', 1, '<div><p>Product list name goes here<p></dev>'),
  ('process', 0, '<div><h1>Process Title</h1></dev>'),
  ('process', 1, '<div><p>Process description goes here<p></dev>'),
  ('contact us', 0, '<div><h1>Contact Us Title</h1></dev>'),
  ('contact us', 1, '<div><p>Contact us content goes here<p></dev>')
;

INSERT INTO delivery_route (name, description)
VALUES ('Pick Up', 'Customer picks up orders.')
ON CONFLICT (name) DO NOTHING;

INSERT INTO company_info
VALUES
  ('name', 'ETR Merchandise Co.'),
  ('addressStreet', '734 South Alameda St.'),
  ('addressCity', 'Los Angeles'),
  ('addressState', 'CA'),
  ('addressZip', '90021'),
  ('phone', '213-489-4989'),
  ('email', 'etrmax@gmail.com'),
  ('logoUrl', 'https://s3-us-west-2.amazonaws.com/om-public/om-app-dev/favicon.png')
ON CONFLICT (key) DO NOTHING
;
