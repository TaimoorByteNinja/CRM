-- SQL query to remove test purchases
DELETE FROM user_purchases 
WHERE phone_number = '+923034091907' 
AND purchase_id LIKE 'TEST-%';

-- Check remaining purchases
SELECT purchase_id, total_amount, supplier_name, created_at 
FROM user_purchases 
WHERE phone_number = '+923034091907' 
ORDER BY created_at DESC;
