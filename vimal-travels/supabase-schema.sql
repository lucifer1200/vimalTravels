-- Run this in Supabase SQL Editor

-- Customers
create table if not exists customers (
  id          uuid primary key default gen_random_uuid(),
  code        text,
  name        text not null,
  mobile      text,
  phone       text,
  email       text,
  address     text,
  city        text,
  state       text,
  state_code  text,
  gstin       text,
  type        text default 'individual',
  created_at  timestamptz default now()
);

-- Counters (for invoice numbering)
create table if not exists counters (
  key    text primary key,
  value  integer not null default 0
);

-- Invoices (items + payments stored as JSONB)
create table if not exists invoices (
  id              uuid primary key default gen_random_uuid(),
  invoice_no      text unique not null,
  type            text not null,
  airline         text,
  customer_id     uuid references customers(id) on delete set null,
  customer        jsonb not null,
  date            date not null,
  due_date        date,
  items           jsonb not null default '[]',
  subtotal        numeric default 0,
  service_charge  numeric default 0,
  gst_type        text default 'none',
  gst_rate        numeric default 0,
  sac_code        text,
  cgst            numeric default 0,
  sgst            numeric default 0,
  igst            numeric default 0,
  gst             numeric default 0,
  taxable_amount  numeric default 0,
  fare_total      numeric default 0,
  financial_year  text,
  total           numeric not null default 0,
  notes           text,
  status          text not null default 'due',
  payments        jsonb not null default '[]',
  created_at      timestamptz default now()
);

-- Enquiries
create table if not exists enquiries (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  email        text,
  phone        text,
  destination  text,
  travel_date  text,
  travellers   text,
  message      text,
  status       text default 'new',
  created_at   timestamptz default now()
);

-- Disable RLS for now (admin-only app, no public access to these tables)
alter table customers disable row level security;
alter table invoices  disable row level security;
alter table counters  disable row level security;
alter table enquiries disable row level security;
