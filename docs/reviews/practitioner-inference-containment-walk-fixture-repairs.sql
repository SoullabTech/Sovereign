-- recorded in walk fixture repair log
ALTER TABLE members ADD COLUMN IF NOT EXISTS must_reset_password BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE members SET studio_mode='practice' WHERE username IN ('walk_prac_a','walk_prac_b');
UPDATE members SET is_practitioner=TRUE WHERE username IN ('walk_prac_a','walk_prac_b');
UPDATE members SET studio_mode='personal' WHERE username='walk_client_c';
