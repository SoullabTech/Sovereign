-- Synthetic-only contract fixture. No production data, clients, or restores.
CREATE TABLE public.members(id uuid PRIMARY KEY);
CREATE TABLE public.soul_portraits(id uuid PRIMARY KEY);
CREATE TABLE public.practitioners(id uuid PRIMARY KEY, name text, email text);
CREATE TABLE public.scheduled_sends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id uuid NOT NULL REFERENCES public.practitioners(id),
  author_member_id uuid NOT NULL,
  channel text NOT NULL DEFAULT 'email' CHECK (channel='email'),
  recipient_email text NOT NULL CHECK (length(btrim(recipient_email)) > 0),
  recipient_name text,
  subject text NOT NULL,
  body text NOT NULL,
  scheduled_for timestamptz NOT NULL,
  consent_confirmed boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending'
    CONSTRAINT scheduled_sends_status_check
    CHECK(status IN ('pending','sent','failed','canceled')),
  attempts integer NOT NULL DEFAULT 0,
  sent_at timestamptz, provider text, provider_message_id text, last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.members(id) VALUES ('22222222-2222-4222-8222-222222222222');
INSERT INTO public.soul_portraits(id) VALUES ('33333333-3333-4333-8333-333333333333');
INSERT INTO public.practitioners(id,name,email)
VALUES ('11111111-1111-4111-8111-111111111111','Synthetic practitioner','synthetic-operator@example.invalid');
INSERT INTO public.scheduled_sends (
id, practitioner_id, author_member_id, recipient_email, subject, body,
scheduled_for, consent_confirmed
) VALUES
('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
 '11111111-1111-4111-8111-111111111111',
 '22222222-2222-4222-8222-222222222222',
 'one@example.invalid','Synthetic test one','Synthetic body',now()-interval '1 minute',true),
('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
 '11111111-1111-4111-8111-111111111111',
 '22222222-2222-4222-8222-222222222222',
 'no-consent@example.invalid','Synthetic test no consent','Synthetic body',now()-interval '1 minute',false),
('cccccccc-cccc-4ccc-8ccc-cccccccccccc',
 '11111111-1111-4111-8111-111111111111',
 '22222222-2222-4222-8222-222222222222',
 'future@example.invalid','Synthetic future','Synthetic body',now()+interval '3 day',true);
