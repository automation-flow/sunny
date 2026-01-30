-- Sunny ERP Database Schema
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS lines_of_business CASCADE;
DROP TABLE IF EXISTS exchange_rates CASCADE;
DROP TABLE IF EXISTS partners CASCADE;

-- Create ENUM types (drop first if exists)
DROP TYPE IF EXISTS account_type CASCADE;
DROP TYPE IF EXISTS parent_category CASCADE;
DROP TYPE IF EXISTS currency_code CASCADE;
DROP TYPE IF EXISTS beneficiary_type CASCADE;
DROP TYPE IF EXISTS invoice_status CASCADE;
DROP TYPE IF EXISTS client_status CASCADE;
DROP TYPE IF EXISTS withdrawal_method CASCADE;

CREATE TYPE account_type AS ENUM ('Business_Credit', 'Private_Credit', 'Bank_Transfer');
CREATE TYPE parent_category AS ENUM ('COGS', 'OPEX', 'Mixed', 'Financial');
CREATE TYPE currency_code AS ENUM ('ILS', 'USD', 'EUR', 'GBP');
CREATE TYPE beneficiary_type AS ENUM ('Business', 'Heli', 'Shahar');
CREATE TYPE invoice_status AS ENUM ('Draft', 'Sent', 'Overdue', 'Paid');
CREATE TYPE client_status AS ENUM ('Active', 'Inactive');
CREATE TYPE withdrawal_method AS ENUM ('Bank_Transfer', 'Cash', 'Check');

-- Partners table
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  icon_color VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accounts table
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type account_type NOT NULL,
  partner_id UUID REFERENCES partners(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  parent_category parent_category NOT NULL,
  tax_recognition_percent DECIMAL(5,4) NOT NULL DEFAULT 1.0000,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lines of Business table
CREATE TABLE lines_of_business (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(200) NOT NULL,
  contact_info TEXT,
  lob_id UUID REFERENCES lines_of_business(id),
  status client_status DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions (Expenses) table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  supplier_name VARCHAR(200) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'ILS',
  exchange_rate_to_ils DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
  amount_ils DECIMAL(12,2) GENERATED ALWAYS AS (amount * exchange_rate_to_ils) STORED,
  category_id UUID NOT NULL REFERENCES categories(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  beneficiary beneficiary_type NOT NULL DEFAULT 'Business',
  applied_tax_percent DECIMAL(5,4) NOT NULL,
  client_id UUID REFERENCES clients(id),
  invoice_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES partners(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'ILS',
  exchange_rate_to_ils DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
  amount_ils DECIMAL(12,2) GENERATED ALWAYS AS (amount * exchange_rate_to_ils) STORED,
  includes_vat BOOLEAN DEFAULT true,
  vat_rate DECIMAL(5,4) DEFAULT 0.1800,
  date_issued DATE NOT NULL,
  due_date DATE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'Draft',
  date_paid DATE,
  heli_split_percent DECIMAL(5,2) DEFAULT 50.00,
  shahar_split_percent DECIMAL(5,2) DEFAULT 50.00,
  invoice_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES partners(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT split_sum_check CHECK (heli_split_percent + shahar_split_percent = 100)
);

-- Withdrawals table
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES partners(id),
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  method withdrawal_method NOT NULL DEFAULT 'Bank_Transfer',
  notes TEXT,
  created_by UUID REFERENCES partners(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Exchange rates cache table
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  currency currency_code NOT NULL,
  rate_to_ils DECIMAL(10,4) NOT NULL,
  source VARCHAR(50) DEFAULT 'exchangerate-api',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, currency)
);

-- Create indexes for better performance
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_beneficiary ON transactions(beneficiary);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_withdrawals_partner ON withdrawals(partner_id);
CREATE INDEX idx_withdrawals_date ON withdrawals(date DESC);

-- Disable RLS for all tables (simpler for this app with email whitelist auth)
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE lines_of_business ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users full access
CREATE POLICY "Allow authenticated users" ON partners FOR ALL USING (true);
CREATE POLICY "Allow authenticated users" ON accounts FOR ALL USING (true);
CREATE POLICY "Allow authenticated users" ON categories FOR ALL USING (true);
CREATE POLICY "Allow authenticated users" ON lines_of_business FOR ALL USING (true);
CREATE POLICY "Allow authenticated users" ON clients FOR ALL USING (true);
CREATE POLICY "Allow authenticated users" ON transactions FOR ALL USING (true);
CREATE POLICY "Allow authenticated users" ON invoices FOR ALL USING (true);
CREATE POLICY "Allow authenticated users" ON withdrawals FOR ALL USING (true);
CREATE POLICY "Allow authenticated users" ON exchange_rates FOR ALL USING (true);

-- Grant access to authenticated and anon users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
