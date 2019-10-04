-- After adding order_t.has_invoice, we need to set the column according to 
-- order status.
UPDATE order_t
SET has_invoice=true
WHERE status IN ('Submitted', 'Completed');
