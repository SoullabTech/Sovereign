-- Fix all beta tester passwords to use bcrypt hash of "Mandala21"
-- Generated on 2026-01-26

-- Update ALL members to use the correct password hash for "Mandala21"
UPDATE members
SET password_hash = '$2b$10$HQYJyHmFYZT5oVfIx7QdT.elMviw4BJkYrjifmsPHo01zINjNSGsi',
    password_algo = 'bcrypt'
WHERE password_hash IS NOT NULL;

-- Verify the update
SELECT username, email,
       CASE WHEN password_hash = '$2b$10$HQYJyHmFYZT5oVfIx7QdT.elMviw4BJkYrjifmsPHo01zINjNSGsi'
            THEN 'FIXED'
            ELSE 'NOT_FIXED'
       END as status
FROM members
ORDER BY username;
