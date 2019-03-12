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

TRUNCATE TABLE delivery_route CASCADE;
INSERT INTO delivery_route (id, description)
VALUES ('Pick Up', 'Customer picks up orders.')
;