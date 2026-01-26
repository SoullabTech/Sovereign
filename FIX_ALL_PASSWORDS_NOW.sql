-- Run this SQL on your production database to fix ALL beta tester passwords to 'Mandala21'
-- Hash verified: bcrypt('$2b$10$') for 'Mandala21'

UPDATE members 
SET password_hash = '$2b$10$HQYJyHmFYZT5oVfIx7QdT.elMviw4BJkYrjifmsPHo01zINjNSGsi',
    password_algo = 'bcrypt'
WHERE password_hash IS NOT NULL;

-- Verify
SELECT username, email, 'Password is now Mandala21' as status FROM members ORDER BY username;
