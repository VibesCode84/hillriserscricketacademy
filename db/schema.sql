-- HillRisers Cricket Academy — booking database (PostgreSQL / Supabase)
-- The app also creates these tables automatically on first connection.

create table if not exists academy_sessions (
  id text primary key,
  title text not null,
  discipline text,            -- null until the academy for this slot is decided
  day text not null,
  start_time text,            -- null until the slot's time is agreed
  end_time text,
  age_min int,
  age_max int,
  capacity int not null check (capacity > 0),
  price_pence int not null,
  stripe_price_id text,
  active boolean not null default true,
  confirmed boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists parents (
  id uuid primary key,
  name text not null,
  email text not null unique,
  mobile text not null,
  created_at timestamptz not null default now()
);

create table if not exists players (
  id uuid primary key,
  parent_id uuid not null references parents(id),
  name text not null,
  date_of_birth date not null,
  gender text not null,
  experience text not null,
  interest text not null,
  club_or_school text,
  playing_profile text,
  recommended_pathway text,
  heard_about text,
  emergency_contact_name text not null,
  emergency_contact_phone text not null,
  medical_notes text,
  photo_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id uuid primary key,
  player_id uuid not null references players(id),
  parent_id uuid not null references parents(id),
  session_id text not null references academy_sessions(id),
  session_date date,
  status text not null check (status in
    ('pending_payment','confirmed','cancelled','expired','refunded','part_refunded','waitlist')),
  payment_type text not null default 'single',
  is_trial boolean not null default false,
  hold_expires_at timestamptz,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_paid_pence int,
  amount_refunded_pence int,
  attended boolean,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bookings_session_idx on bookings(session_id, status);
create index if not exists bookings_pi_idx on bookings(stripe_payment_intent_id);

-- Upgrades for databases created by earlier versions of this schema
alter table players add column if not exists heard_about text;
alter table academy_sessions alter column discipline drop not null;
alter table academy_sessions alter column start_time drop not null;
alter table academy_sessions alter column end_time drop not null;
alter table academy_sessions alter column age_min drop not null;
alter table academy_sessions alter column age_max drop not null;

create table if not exists trial_requests (
  id uuid primary key,
  parent_id uuid not null references parents(id),
  player_id uuid not null references players(id),
  academy text not null,
  preferred_days text[] not null default '{}',
  notes text,
  status text not null default 'new' check (status in ('new','contacted','booked','closed')),
  deposit_status text not null default 'none' check (deposit_status in ('none','pending','paid','applied','refunded')),
  deposit_pence int,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  deposit_refunded_pence int,
  created_at timestamptz not null default now()
);
create index if not exists trial_requests_pi_idx on trial_requests(stripe_payment_intent_id);

create table if not exists waitlist (
  id uuid primary key,
  session_id text not null references academy_sessions(id),
  parent_name text not null,
  player_name text not null,
  date_of_birth date not null,
  email text not null,
  mobile text not null,
  status text not null default 'waiting',
  created_at timestamptz not null default now()
);

create table if not exists enquiries (
  id uuid primary key,
  parent_name text not null,
  email text not null,
  mobile text,
  child_age int,
  message text not null,
  source text not null,
  created_at timestamptz not null default now()
);

create table if not exists camp_interests (
  id uuid primary key,
  camps text[] not null default '{}',
  parent_name text not null,
  email text not null,
  mobile text,
  child_name text not null,
  child_age int not null,
  interest text not null,
  notes text,
  created_at timestamptz not null default now()
);
