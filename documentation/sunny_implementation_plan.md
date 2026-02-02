# 🌅 SUNNY - Automation Flow's CFO
## Complete Implementation Plan for Claude Code in Antigravity

**Version:** 1.0  
**Date:** January 2026  
**Status:** Ready for Implementation

---

# 📋 TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [API Endpoints](#4-api-endpoints)
5. [Authentication](#5-authentication)
6. [Design System](#6-design-system)
7. [Page-by-Page Specifications](#7-page-specifications)
8. [Business Logic](#8-business-logic)
9. [Seed Data](#9-seed-data)
10. [Implementation Phases](#10-implementation-phases)

---

# 1. PROJECT OVERVIEW

## 1.1 What is Sunny?

Sunny is a financial management system (ERP) built for **Automation Flow** (www.automationsflow.com), a partnership business providing automation solutions and AI agents to companies.

**Core Purpose:**
- Track all income and expenses
- Manage invoices and collections
- Calculate partner equity and fairness between two partners (Heli & Shahar)
- Provide financial analytics and insights

## 1.2 Key Users

| User | Email | Role |
|------|-------|------|
| Heli | heli@automationsflow.com | Partner (50%) |
| Shahar | shahar@automationsflow.com | Partner (50%) |

## 1.3 Business Context

- **Entity Type:** Partnership (Shutafut) registered in Israel
- **Tax Status:** Osek Murshe (VAT registered)
- **Expected Annual Revenue:** ~500,000 ILS
- **Fiscal Year:** Calendar year (Jan 1 - Dec 31)
- **Business Start Date:** January 1, 2026
- **VAT Rate:** 18% (Israel standard)

## 1.4 Core Features

1. **Expense Management** - Track all business and partner expenses
2. **Invoice Management** - Track receivables, due dates, payment status
3. **Client Management** - Manage clients with Line of Business classification
4. **Partner Balance** - Calculate fair equity split and track withdrawals
5. **Analytics Dashboard** - Quarterly and yearly financial insights
6. **Configuration** - Manage categories, accounts, LOBs

---

# 2. TECH STACK

## 2.1 Frontend

```
Framework:      Next.js 14 (App Router)
Language:       TypeScript
Styling:        Tailwind CSS
Components:     shadcn/ui (customized for Apple-like design)
Icons:          Lucide React
Font:           SF Pro Display (with Inter as fallback)
Charts:         Recharts
Forms:          React Hook Form + Zod validation
State:          React Query (TanStack Query) for server state
```

## 2.2 Backend

```
API:            Next.js API Routes (App Router)
Database:       Supabase (PostgreSQL)
Auth:           Supabase Auth with Google OAuth
File Storage:   External (Google Drive links)
Exchange Rates: ExchangeRate-API (free tier)
```

## 2.3 Infrastructure

```
Hosting:        Vercel
Database:       Supabase Cloud
Domain:         TBD (e.g., sunny.automationsflow.com)
```

## 2.4 Project Structure

```
sunny/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Main layout with sidebar
│   │   ├── page.tsx                # Dashboard (home)
│   │   ├── expenses/
│   │   │   └── page.tsx
│   │   ├── invoices/
│   │   │   └── page.tsx
│   │   ├── clients/
│   │   │   └── page.tsx
│   │   ├── partners/
│   │   │   └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── configuration/
│   │       └── page.tsx
│   ├── api/
│   │   ├── transactions/
│   │   │   ├── route.ts            # GET, POST
│   │   │   └── [id]/
│   │   │       └── route.ts        # GET, PATCH, DELETE
│   │   ├── invoices/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── clients/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── withdrawals/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── categories/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── accounts/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── lob/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       └── route.ts
│   │   ├── partners/
│   │   │   └── [id]/
│   │   │       └── balance/
│   │   │           └── route.ts    # GET partner balance
│   │   ├── exchange-rate/
│   │   │   └── route.ts            # GET daily rate
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts
│   ├── globals.css
│   └── layout.tsx
├── components/
│   ├── ui/                         # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── year-selector.tsx
│   ├── dashboard/
│   │   ├── stats-card.tsx
│   │   ├── partner-balance-mini.tsx
│   │   └── overdue-alert.tsx
│   ├── expenses/
│   │   ├── expense-table.tsx
│   │   ├── expense-form.tsx
│   │   └── expense-row.tsx
│   ├── invoices/
│   │   ├── invoice-list.tsx
│   │   ├── invoice-form.tsx
│   │   ├── invoice-card.tsx
│   │   └── status-group.tsx
│   ├── clients/
│   │   ├── client-table.tsx
│   │   └── client-form.tsx
│   ├── partners/
│   │   ├── balance-card.tsx
│   │   ├── withdrawal-form.tsx
│   │   └── withdrawal-history.tsx
│   ├── analytics/
│   │   ├── quarterly-chart.tsx
│   │   ├── lob-breakdown.tsx
│   │   └── top-clients.tsx
│   └── shared/
│       ├── empty-state.tsx
│       ├── loading-spinner.tsx
│       ├── currency-display.tsx
│       └── partner-icon.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser client
│   │   ├── server.ts               # Server client
│   │   └── admin.ts                # Admin client (for seeding)
│   ├── utils/
│   │   ├── currency.ts             # Format currency, convert
│   │   ├── dates.ts                # Date formatting
│   │   ├── calculations.ts         # Partner balance, P&L
│   │   └── exchange-rate.ts        # Fetch & cache rates
│   ├── validations/
│   │   ├── transaction.ts          # Zod schemas
│   │   ├── invoice.ts
│   │   └── client.ts
│   └── constants.ts                # App-wide constants
├── hooks/
│   ├── use-transactions.ts
│   ├── use-invoices.ts
│   ├── use-clients.ts
│   ├── use-partner-balance.ts
│   └── use-exchange-rate.ts
├── types/
│   └── index.ts                    # TypeScript interfaces
├── public/
│   ├── logo.png                    # Sunny logo
│   └── favicon.ico
├── middleware.ts                   # Auth protection
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

# 3. DATABASE SCHEMA

## 3.1 Complete Schema (Supabase PostgreSQL)

### Table: `partners`

```sql
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  icon_color VARCHAR(20) NOT NULL, -- 'pink' for Heli, 'blue' for Shahar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO partners (name, email, icon_color) VALUES
  ('Heli', 'heli@automationsflow.com', 'pink'),
  ('Shahar', 'shahar@automationsflow.com', 'blue');
```

### Table: `accounts` (Payment Methods)

```sql
CREATE TYPE account_type AS ENUM (
  'Business_Credit',
  'Private_Credit', 
  'Bank_Transfer'
);

CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type account_type NOT NULL,
  partner_id UUID REFERENCES partners(id), -- NULL for business accounts
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO accounts (name, type, partner_id) VALUES
  ('Business Bank Account', 'Bank_Transfer', NULL),
  ('Heli Business Card', 'Business_Credit', NULL),
  ('Shahar Business Card', 'Business_Credit', NULL),
  ('Heli Private Card', 'Private_Credit', (SELECT id FROM partners WHERE name = 'Heli')),
  ('Shahar Private Card', 'Private_Credit', (SELECT id FROM partners WHERE name = 'Shahar'));
```

### Table: `categories`

```sql
CREATE TYPE parent_category AS ENUM ('COGS', 'OPEX', 'Financial');

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  parent_category parent_category NOT NULL,
  tax_recognition_percent DECIMAL(5,4) NOT NULL DEFAULT 1.0000, -- 1.0 = 100%
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- See Section 9 for seed data
```

### Table: `lines_of_business`

```sql
CREATE TABLE lines_of_business (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data
INSERT INTO lines_of_business (name) VALUES
  ('Retail'),
  ('Legal'),
  ('High-Tech'),
  ('Marketing'),
  ('Healthcare'),
  ('Finance'),
  ('Education'),
  ('Real Estate'),
  ('Other');
```

### Table: `clients`

```sql
CREATE TYPE client_status AS ENUM ('Active', 'Inactive');

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  contact_info TEXT,
  lob_id UUID REFERENCES lines_of_business(id),
  status client_status DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table: `transactions` (Expenses)

```sql
CREATE TYPE currency_code AS ENUM ('ILS', 'USD', 'EUR', 'GBP');
CREATE TYPE beneficiary_type AS ENUM ('Business', 'Heli', 'Shahar');

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  supplier_name VARCHAR(200) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'ILS',
  exchange_rate_to_ils DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
  amount_ils DECIMAL(12,2) GENERATED ALWAYS AS (amount * exchange_rate_to_ils) STORED,
  category_id UUID NOT NULL REFERENCES categories(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  beneficiary beneficiary_type NOT NULL DEFAULT 'Business',
  applied_tax_percent DECIMAL(5,4) NOT NULL, -- Copied from category, can be overridden
  client_id UUID REFERENCES clients(id), -- Optional: for direct project expenses
  invoice_url TEXT, -- Link to Google Drive
  notes TEXT,
  created_by UUID REFERENCES partners(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexes for performance
CREATE INDEX idx_transactions_date ON transactions(date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_beneficiary ON transactions(beneficiary);
CREATE INDEX idx_transactions_year ON transactions(EXTRACT(YEAR FROM date));
```

### Table: `invoices` (Receivables)

```sql
CREATE TYPE invoice_status AS ENUM ('Draft', 'Sent', 'Overdue', 'Paid');

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) NOT NULL,
  client_id UUID NOT NULL REFERENCES clients(id),
  description TEXT, -- Project/service description
  amount DECIMAL(12,2) NOT NULL,
  currency currency_code NOT NULL DEFAULT 'ILS',
  exchange_rate_to_ils DECIMAL(10,4) NOT NULL DEFAULT 1.0000,
  amount_ils DECIMAL(12,2) GENERATED ALWAYS AS (amount * exchange_rate_to_ils) STORED,
  includes_vat BOOLEAN DEFAULT true,
  vat_rate DECIMAL(5,4) DEFAULT 0.1800, -- 18% Israel VAT
  date_issued DATE NOT NULL,
  due_date DATE NOT NULL,
  status invoice_status NOT NULL DEFAULT 'Draft',
  date_paid DATE, -- When actually paid
  heli_split_percent DECIMAL(5,2) DEFAULT 50.00,
  shahar_split_percent DECIMAL(5,2) DEFAULT 50.00,
  invoice_url TEXT, -- Link to Google Drive
  notes TEXT,
  created_by UUID REFERENCES partners(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT split_sum_check CHECK (heli_split_percent + shahar_split_percent = 100)
);

-- Indexes
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_client ON invoices(client_id);
CREATE INDEX idx_invoices_year ON invoices(EXTRACT(YEAR FROM date_issued));
```

### Table: `withdrawals` (Partner Salary Draws)

```sql
CREATE TYPE withdrawal_method AS ENUM ('Bank_Transfer', 'Cash', 'Check');

CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Index
CREATE INDEX idx_withdrawals_partner ON withdrawals(partner_id);
CREATE INDEX idx_withdrawals_date ON withdrawals(date DESC);
```

### Table: `exchange_rates` (Cache)

```sql
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  currency currency_code NOT NULL,
  rate_to_ils DECIMAL(10,4) NOT NULL,
  source VARCHAR(50) DEFAULT 'exchangerate-api',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date, currency)
);

-- Index
CREATE INDEX idx_exchange_rates_date ON exchange_rates(date DESC);
```

### Table: `audit_log`

```sql
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE');

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID NOT NULL,
  action audit_action NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID REFERENCES partners(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_audit_log_table ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_date ON audit_log(changed_at DESC);
```

## 3.2 Database Functions

### Function: Auto-update `updated_at`

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  
CREATE TRIGGER update_withdrawals_updated_at BEFORE UPDATE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Function: Audit Log Trigger

```sql
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user from context (set by API)
  current_user_id := current_setting('app.current_user_id', true)::UUID;
  
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_log (table_name, record_id, action, old_values, changed_by)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', to_jsonb(OLD), current_user_id);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW), current_user_id);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_log (table_name, record_id, action, new_values, changed_by)
    VALUES (TG_TABLE_NAME, NEW.id, 'CREATE', to_jsonb(NEW), current_user_id);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
  
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
  
CREATE TRIGGER audit_withdrawals AFTER INSERT OR UPDATE OR DELETE ON withdrawals
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
  
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### Function: Auto-update Invoice Status to Overdue

```sql
CREATE OR REPLACE FUNCTION check_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE invoices
  SET status = 'Overdue', updated_at = NOW()
  WHERE status = 'Sent'
    AND due_date < CURRENT_DATE
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Can be called via cron job or on page load
```

---

# 4. API ENDPOINTS

## 4.1 Transactions (Expenses)

### `GET /api/transactions`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| year | number | Filter by year (required) |
| search | string | Search across supplier, notes, category |
| category_id | UUID | Filter by category |
| beneficiary | string | Filter by beneficiary |
| limit | number | Pagination limit (default: 50) |
| offset | number | Pagination offset |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "date": "2026-01-15",
      "supplier_name": "OpenAI",
      "amount": 20.00,
      "currency": "USD",
      "exchange_rate_to_ils": 3.65,
      "amount_ils": 73.00,
      "category": {
        "id": "uuid",
        "name": "Software Licenses (Prod)",
        "parent_category": "COGS"
      },
      "account": {
        "id": "uuid",
        "name": "Heli Business Card",
        "type": "Business_Credit"
      },
      "beneficiary": "Business",
      "applied_tax_percent": 1.0000,
      "client": null,
      "invoice_url": "https://drive.google.com/...",
      "notes": "ChatGPT Plus subscription",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### `POST /api/transactions`

**Request Body:**
```json
{
  "date": "2026-01-15",
  "supplier_name": "OpenAI",
  "amount": 20.00,
  "currency": "USD",
  "category_id": "uuid",
  "account_id": "uuid",
  "beneficiary": "Business",
  "applied_tax_percent": 1.0000,
  "client_id": null,
  "invoice_url": "https://drive.google.com/...",
  "notes": "ChatGPT Plus"
}
```

**Response:** Created transaction object (201)

### `PATCH /api/transactions/[id]`

**Request Body:** Partial transaction object

**Response:** Updated transaction object (200)

### `DELETE /api/transactions/[id]`

**Action:** Soft delete (sets `deleted_at`)

**Response:** 204 No Content

---

## 4.2 Invoices

### `GET /api/invoices`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| year | number | Filter by year (required) |
| status | string | Filter by status |
| client_id | UUID | Filter by client |

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "invoice_number": "INV-2026-001",
      "client": {
        "id": "uuid",
        "name": "Acme Corp"
      },
      "description": "n8n Automation Setup",
      "amount": 5000.00,
      "currency": "ILS",
      "amount_ils": 5000.00,
      "includes_vat": true,
      "vat_rate": 0.1800,
      "date_issued": "2026-01-10",
      "due_date": "2026-02-10",
      "status": "Sent",
      "date_paid": null,
      "heli_split_percent": 50.00,
      "shahar_split_percent": 50.00
    }
  ],
  "summary": {
    "total_outstanding": 15000.00,
    "total_overdue": 3000.00,
    "count_by_status": {
      "Draft": 1,
      "Sent": 3,
      "Overdue": 1,
      "Paid": 10
    }
  }
}
```

### `POST /api/invoices`

**Request Body:**
```json
{
  "invoice_number": "INV-2026-002",
  "client_id": "uuid",
  "description": "AI Agent Development",
  "amount": 10000.00,
  "currency": "ILS",
  "includes_vat": true,
  "date_issued": "2026-01-20",
  "due_date": "2026-02-20",
  "status": "Draft",
  "heli_split_percent": 50.00,
  "shahar_split_percent": 50.00
}
```

### `PATCH /api/invoices/[id]`

**Special:** When `status` changes to `Paid`, automatically set `date_paid` to current date if not provided.

### `DELETE /api/invoices/[id]`

**Action:** Soft delete

---

## 4.3 Clients

### `GET /api/clients`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "contact_info": "john@acme.com",
      "lob": {
        "id": "uuid",
        "name": "High-Tech"
      },
      "status": "Active",
      "stats": {
        "total_invoiced": 50000.00,
        "total_paid": 35000.00,
        "total_outstanding": 15000.00,
        "invoice_count": 5
      }
    }
  ]
}
```

### `POST /api/clients`

### `PATCH /api/clients/[id]`

### `DELETE /api/clients/[id]`

**Validation:** Cannot delete if has linked invoices or transactions.

---

## 4.4 Partner Balance

### `GET /api/partners/[id]/balance`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| year | number | Filter by year (optional, default: current) |

**Response:**
```json
{
  "partner_id": "uuid",
  "partner_name": "Heli",
  "year": 2026,
  "breakdown": {
    "total_income": 100000.00,
    "partner_income_share": 50000.00,
    "total_expenses_share": 15000.00,
    "base_share": 35000.00,
    "company_owes_partner": 2500.00,
    "partner_owes_company": 1000.00,
    "fairness_adjustment": 1500.00,
    "total_withdrawn": 20000.00
  },
  "net_available": 16500.00,
  "calculation_notes": [
    "Income based on 5 paid invoices",
    "Company owes: 10 private expenses for business (tax-adjusted)",
    "Partner owes: 2 business expenses for personal benefit"
  ]
}
```

---

## 4.5 Withdrawals

### `GET /api/withdrawals`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| partner_id | UUID | Filter by partner |
| year | number | Filter by year |

### `POST /api/withdrawals`

**Request Body:**
```json
{
  "partner_id": "uuid",
  "amount": 5000.00,
  "date": "2026-01-25",
  "method": "Bank_Transfer",
  "notes": "January salary"
}
```

**Validation:** Warn (but allow) if amount > net_available

### `DELETE /api/withdrawals/[id]`

---

## 4.6 Configuration Endpoints

### Categories: `GET/POST/PATCH/DELETE /api/categories`
### Accounts: `GET/POST/PATCH/DELETE /api/accounts`
### Lines of Business: `GET/POST/PATCH/DELETE /api/lob`

**Delete Validation:** Cannot delete if records exist using this item.

---

## 4.7 Exchange Rate

### `GET /api/exchange-rate`

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| date | string | Date (YYYY-MM-DD) |
| currency | string | Currency code (USD, EUR, GBP) |

**Logic:**
1. Check `exchange_rates` table for cached rate
2. If not found, fetch from ExchangeRate-API
3. Cache the result
4. Return rate

**Response:**
```json
{
  "date": "2026-01-15",
  "currency": "USD",
  "rate_to_ils": 3.6500,
  "source": "exchangerate-api"
}
```

---

# 5. AUTHENTICATION

## 5.1 Google OAuth Setup

Using Supabase Auth with Google provider.

### Supabase Configuration

```javascript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Allowed Users (Whitelist)

```typescript
// lib/constants.ts
export const ALLOWED_EMAILS = [
  'heli@automationsflow.com',
  'shahar@automationsflow.com'
] as const;
```

### Middleware Protection

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ALLOWED_EMAILS } from '@/lib/constants'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          response.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )
  
  const { data: { user } } = await supabase.auth.getUser()
  
  // Not logged in -> redirect to login
  if (!user && !request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Logged in but not allowed -> redirect to unauthorized
  if (user && !ALLOWED_EMAILS.includes(user.email as any)) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
  }
  
  // Logged in and on login page -> redirect to dashboard
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png).*)']
}
```

### Login Page

```typescript
// app/(auth)/login/page.tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function LoginPage() {
  const supabase = createClient()
  
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
  }
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="glass-card p-12 text-center max-w-md">
        <Image 
          src="/logo.png" 
          alt="Sunny" 
          width={80} 
          height={80} 
          className="mx-auto mb-6"
        />
        <h1 className="text-3xl font-semibold text-white mb-2">
          Sunny
        </h1>
        <p className="text-gray-400 mb-8">
          Automation Flow's CFO
        </p>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black font-medium py-3 px-6 rounded-xl
                     hover:bg-gray-100 transition flex items-center justify-center gap-3"
        >
          <GoogleIcon />
          Sign in with Google
        </button>
        
        <p className="text-xs text-gray-500 mt-6">
          Authorized partners only
        </p>
      </div>
    </div>
  )
}
```

---

# 6. DESIGN SYSTEM

## 6.1 Design Philosophy

**Inspiration:** Apple Human Interface Guidelines (Dark Mode)
**Style:** Clean, minimal, professional with glassmorphism accents
**Approach:** Content-first, generous whitespace, clear hierarchy

## 6.2 Color Palette

```css
/* globals.css */
:root {
  /* Backgrounds */
  --bg-primary: #000000;           /* Pure black */
  --bg-secondary: #1c1c1e;         /* Dark gray (Apple systemGray6) */
  --bg-tertiary: #2c2c2e;          /* Lighter gray */
  --bg-glass: rgba(255, 255, 255, 0.05);
  --bg-glass-hover: rgba(255, 255, 255, 0.08);
  
  /* Text */
  --text-primary: #ffffff;          /* White */
  --text-secondary: #8e8e93;        /* Gray (Apple systemGray) */
  --text-tertiary: #636366;         /* Darker gray */
  
  /* Accent Colors (Apple System Colors) */
  --color-blue: #007aff;            /* Primary actions */
  --color-green: #30d158;           /* Income, success, positive */
  --color-red: #ff3b30;             /* Expenses, errors, negative */
  --color-orange: #ff9500;          /* Warnings */
  --color-yellow: #ffd60a;          /* Highlights */
  --color-purple: #bf5af2;          /* Special */
  --color-cyan: #64d2ff;            /* Info */
  
  /* Partner Colors */
  --color-heli: #ff6b9d;            /* Pink for Heli */
  --color-shahar: #5ac8fa;          /* Blue for Shahar */
  --color-business: #64d2ff;        /* Cyan for Business */
  
  /* Status Colors */
  --status-draft: #8e8e93;
  --status-sent: #007aff;
  --status-overdue: #ff3b30;
  --status-paid: #30d158;
  
  /* Category Colors */
  --category-cogs: #ff6b6b;         /* Red-ish */
  --category-opex: #4ecdc4;         /* Teal */
  --category-financial: #a855f7;    /* Purple */
  
  /* Borders & Dividers */
  --border-primary: rgba(255, 255, 255, 0.1);
  --border-secondary: rgba(255, 255, 255, 0.05);
}
```

## 6.3 Typography

```css
/* Font Family */
--font-display: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
--font-text: 'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
--font-mono: 'SF Mono', 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;     /* 12px */
--text-sm: 0.875rem;    /* 14px */
--text-base: 1rem;      /* 16px */
--text-lg: 1.125rem;    /* 18px */
--text-xl: 1.25rem;     /* 20px */
--text-2xl: 1.5rem;     /* 24px */
--text-3xl: 1.875rem;   /* 30px */
--text-4xl: 2.25rem;    /* 36px */
--text-hero: 3.5rem;    /* 56px - for partner balance */

/* Font Weights */
--font-regular: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 6.4 Component Styles

### Glass Card

```css
.glass-card {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-primary);
  border-radius: 16px;
}
```

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: var(--color-blue);
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 12px;
  transition: opacity 0.2s;
}
.btn-primary:hover {
  opacity: 0.9;
}

/* Secondary Button */
.btn-secondary {
  background: var(--bg-glass);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--color-blue);
}
```

### Inputs

```css
.input {
  background: var(--bg-glass);
  border: 1px solid var(--border-primary);
  border-radius: 12px;
  padding: 12px 16px;
  color: var(--text-primary);
  font-size: var(--text-base);
  transition: border-color 0.2s;
}
.input:focus {
  outline: none;
  border-color: var(--color-blue);
}
.input::placeholder {
  color: var(--text-tertiary);
}
```

### Tables

```css
.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.table th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 500;
  font-size: var(--text-sm);
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-primary);
}
.table td {
  padding: 16px;
  font-size: var(--text-sm);
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-secondary);
}
/* No zebra striping, no hover effect */
```

### Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: var(--text-xs);
  font-weight: 500;
}
.badge-cogs {
  background: rgba(255, 107, 107, 0.15);
  color: #ff6b6b;
}
.badge-opex {
  background: rgba(78, 205, 196, 0.15);
  color: #4ecdc4;
}
.badge-financial {
  background: rgba(168, 85, 247, 0.15);
  color: #a855f7;
}
```

### Status Indicators

```css
.status-draft { color: var(--status-draft); }
.status-sent { color: var(--status-sent); }
.status-overdue { color: var(--status-overdue); }
.status-paid { color: var(--status-paid); }
```

## 6.5 Layout

### Sidebar Width
- Expanded: 260px
- Content max-width: 1400px
- Card padding: 24px
- Section gap: 32px

### Spacing Scale (Tailwind)
```
4px  = p-1
8px  = p-2
12px = p-3
16px = p-4
24px = p-6
32px = p-8
48px = p-12
```

## 6.6 Icons

Using **Lucide React** icons. Key icons:

| Context | Icon |
|---------|------|
| Dashboard | `LayoutDashboard` |
| Expenses | `Coins` |
| Invoices | `FileText` |
| Clients | `Users` |
| Partners | `Scale` |
| Analytics | `BarChart3` |
| Configuration | `Settings` |
| Add | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| Heli | `UserRound` (pink) |
| Shahar | `User` (blue) |
| Business | `Briefcase` (cyan) |
| Money In | `ArrowDownLeft` (green) |
| Money Out | `ArrowUpRight` (red) |

## 6.7 Logo

Use the provided `Sunny.png` logo. Display in sidebar at 40x40px.

---

# 7. PAGE SPECIFICATIONS

## 7.1 Layout (All Pages)

### Sidebar Navigation

```
┌─────────────────────────────────────────────────────────────────┐
│ [Logo] Sunny                              [Year: 2026 ▼]        │
├──────────────┬──────────────────────────────────────────────────┤
│              │                                                  │
│  🏠 Dashboard │  [Page Content Area]                            │
│              │                                                  │
│  💰 Expenses │                                                  │
│              │                                                  │
│  🧾 Invoices │                                                  │
│              │                                                  │
│  👥 Clients  │                                                  │
│              │                                                  │
│  ⚖️ Partners │                                                  │
│              │                                                  │
│  📊 Analytics│                                                  │
│              │                                                  │
│  ⚙️ Config   │                                                  │
│              │                                                  │
│              │                                                  │
│ ─────────────│                                                  │
│ [User Avatar]│                                                  │
│ Heli         │                                                  │
│ Sign Out     │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### Year Selector

- Dropdown at top of sidebar
- Options: 2026, 2027, 2028... (dynamically add as years progress)
- Selected year filters ALL data in the app
- Persisted in localStorage

---

## 7.2 Dashboard Page (`/`)

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Dashboard                                                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌───────────┐│
│  │ Total Income│ │    COGS     │ │    OPEX     │ │Gross Marg.││
│  │ ₪125,000    │ │  ₪15,000    │ │  ₪25,000    │ │   68%     ││
│  │ ▲ 12%       │ │             │ │             │ │           ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └───────────┘│
│                                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────────┐
│  │ Net Profit  │ │Partner Diff │ │ Open Invoices              ││
│  │ ₪85,000     │ │ ₪1,200      │ │ 3 Sent (₪15,000)          ││
│  │             │ │ Heli +      │ │ 1 Overdue (₪5,000) ⚠️     ││
│  └─────────────┘ └─────────────┘ └─────────────────────────────┘
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Stats Cards

1. **Total Income** (Green text)
   - Sum of all PAID invoices (amount_ils) for selected year
   
2. **COGS** (Red text)
   - Sum of transactions where category.parent_category = 'COGS'
   
3. **OPEX** (Red text)
   - Sum of transactions where category.parent_category = 'OPEX'
   
4. **Gross Margin %**
   - Formula: ((Income - COGS) / Income) * 100
   
5. **Net Profit** (Green/Red based on value)
   - Formula: Income - COGS - OPEX - Financial
   
6. **Partner Balance Diff**
   - Show which partner is ahead and by how much
   - "Heli +₪1,200" or "Even"
   
7. **Open Invoices**
   - Count and sum of Sent + Overdue
   - Red warning if any Overdue

---

## 7.3 Expenses Page (`/expenses`)

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Expenses                                    [+ Add Expense]    │
├────────────────────────────────────────────────────────────────┤
│ 🔍 [Search expenses...]                                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Account    │ Date       │ Category          │ Supplier   ... │
│ ────────────┼────────────┼───────────────────┼─────────────────│
│  🏢 Heli Biz│ Jan 15     │ [COGS] Software   │ OpenAI     ... │
│  🏢 Shahar  │ Jan 14     │ [OPEX] Marketing  │ Facebook   ... │
│  💳 Heli Prv│ Jan 12     │ [OPEX] Home Office│ Israel Elec... │
│                                                                │
│  [Infinite scroll - loads more on scroll]                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Table Columns

| # | Column | Width | Content |
|---|--------|-------|---------|
| 1 | Account | 140px | Icon + Account name |
| 2 | Date | 100px | "Jan 15, 2026" |
| 3 | Category | 220px | `[COGS] Software Licenses` badge |
| 4 | Supplier | 180px | Text, truncate |
| 5 | Beneficiary | 100px | Icon + name |
| 6 | Tax % | 70px | "100%" or "25%" |
| 7 | Amount | 140px | Primary: ₪ amount, Secondary: original currency |
| 8 | Actions | 80px | Edit + Delete icons |

### Add/Edit Expense Modal

```
┌─────────────────────────────────────────┐
│ Add Expense                          X  │
├─────────────────────────────────────────┤
│                                         │
│ Date            [2026-01-15      📅]   │
│                                         │
│ Supplier        [OpenAI              ]  │
│                                         │
│ Amount          [20.00] [USD ▼]         │
│                 Rate: 3.65 = ₪73.00     │
│                                         │
│ Category        [Software Licenses ▼]   │
│                                         │
│ Payment Account [Heli Business Card ▼]  │
│                                         │
│ Beneficiary     [Business ▼]            │
│                 ○ Business              │
│                 ○ Heli                  │
│                 ○ Shahar                │
│                                         │
│ Tax Recognition [100    ] %             │
│                 (Auto-filled from cat.) │
│                                         │
│ Invoice Link    [https://drive...    ]  │
│                                         │
│ Notes           [                    ]  │
│                 [                    ]  │
│                                         │
│        [Cancel]           [Save]        │
│                                         │
└─────────────────────────────────────────┘
```

### Logic

1. When currency != ILS, fetch exchange rate for that date
2. When category selected, auto-fill Tax % (allow override)
3. Beneficiary default: Business
4. Account default: First business account

---

## 7.4 Invoices Page (`/invoices`)

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Invoices                                    [+ Add Invoice]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐           │
│  │   Overdue    │ │     Sent     │ │     Paid     │           │
│  │ 2 invoices   │ │ 3 invoices   │ │ 10 invoices  │           │
│  │ ₪8,500       │ │ ₪15,000      │ │ ₪95,000      │           │
│  │ 🔴           │ │ 🔵           │ │ 🟢           │           │
│  └──────────────┘ └──────────────┘ └──────────────┘           │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📋 Overdue (2)                                         [▼]   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Acme Corp                              ₪5,000    [✓][✎] │ │
│  │ INV-2026-003 • Due: Jan 10, 2026                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ TechStart Ltd                          ₪3,500    [✓][✎] │ │
│  │ INV-2026-002 • Due: Jan 5, 2026                         │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  📋 Sent (3)                                            [▼]   │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Global Solutions                       ₪8,000    [✓][✎] │ │
│  │ INV-2026-005 • Due: Feb 15, 2026                        │ │
│  └──────────────────────────────────────────────────────────┘ │
│  ...                                                          │
│                                                                │
│  📋 Paid (10)                                    [Collapsed ▶]│
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Invoice Card

- **Primary:** Client name (large, bold)
- **Secondary:** Invoice number • Due date
- **Amount:** Right-aligned, prominent
- **Actions:** 
  - ✓ (Check) = Mark as Paid
  - ✎ (Pencil) = Edit

### Grouping Logic

1. Overdue (expanded by default) - status = 'Overdue'
2. Sent (expanded by default) - status = 'Sent'
3. Paid (collapsed by default) - status = 'Paid'
4. Draft - only shown if exists, at bottom

### Add/Edit Invoice Modal

```
┌─────────────────────────────────────────┐
│ Add Invoice                          X  │
├─────────────────────────────────────────┤
│                                         │
│ Invoice Number  [INV-2026-006       ]   │
│                                         │
│ Client          [Select client... ▼]    │
│                                         │
│ Description     [n8n Automation Setup]  │
│                                         │
│ Amount          [5000.00] [ILS ▼]       │
│                                         │
│ Includes VAT    [✓] (18%)               │
│                                         │
│ Date Issued     [2026-01-20      📅]    │
│                                         │
│ Due Date        [2026-02-20      📅]    │
│                                         │
│ Status          [Sent ▼]                │
│                                         │
│ ─── Profit Split ───                    │
│ Heli %   [50.00]  Shahar %  [50.00]     │
│                                         │
│ Invoice Link    [https://drive...    ]  │
│                                         │
│ Notes           [                    ]  │
│                                         │
│        [Cancel]           [Save]        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 7.5 Clients Page (`/clients`)

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Clients                                      [+ Add Client]    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Client Name    │ Contact      │ LOB       │ Invoiced │ Paid  │
│ ────────────────┼──────────────┼───────────┼──────────┼───────│
│  🏢 Acme Corp   │ john@acme.com│ High-Tech │ ₪50,000  │₪35,000│
│  🏢 TechStart   │ +972-50-123  │ High-Tech │ ₪30,000  │₪30,000│
│  🏢 LegalEase   │ info@legal.co│ Legal     │ ₪20,000  │₪15,000│
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Table Columns

| Column | Content |
|--------|---------|
| Client Name | Icon + Name |
| Contact | Email or phone |
| LOB | Line of Business badge |
| Total Invoiced | Sum of all invoices |
| Total Paid | Sum of paid invoices |
| Actions | Edit + Delete |

### Add/Edit Client Modal

```
┌─────────────────────────────────────────┐
│ Add Client                           X  │
├─────────────────────────────────────────┤
│                                         │
│ Client Name     [                    ]  │
│                                         │
│ Contact Info    [                    ]  │
│                                         │
│ Line of Business [Select LOB...   ▼]   │
│                                         │
│ Status          [Active ▼]              │
│                                         │
│        [Cancel]           [Save]        │
│                                         │
└─────────────────────────────────────────┘
```

---

## 7.6 Partners Page (`/partners`)

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Partner Balance & Withdrawals                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────┐  ┌─────────────────────────┐ │
│  │         👩 Heli             │  │        👨 Shahar        │ │
│  │                             │  │                         │ │
│  │    Available to Withdraw    │  │   Available to Withdraw │ │
│  │                             │  │                         │ │
│  │       ₪16,500              │  │       ₪15,300          │ │
│  │       (green, huge)         │  │       (green, huge)     │ │
│  │                             │  │                         │ │
│  │  ▼ View Breakdown           │  │  ▼ View Breakdown       │ │
│  │  ─────────────────────────  │  │  ─────────────────────  │ │
│  │  50% Share of Profits:      │  │  50% Share of Profits:  │ │
│  │           +₪42,500          │  │          +₪42,500       │ │
│  │  Company Owes Me:  +₪2,500  │  │  Company Owes Me: +₪800 │ │
│  │  I Owe Company:    -₪1,000  │  │  I Owe Company:  -₪500  │ │
│  │  Already Withdrawn:-₪27,500 │  │  Already Withdrawn:     │ │
│  │                             │  │              -₪27,500   │ │
│  │  ─────────────────────────  │  │  ─────────────────────  │ │
│  │                             │  │                         │ │
│  │  [Record New Withdrawal]    │  │  [Record New Withdrawal]│ │
│  │                             │  │                         │ │
│  └─────────────────────────────┘  └─────────────────────────┘ │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│ Withdrawal History                                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Date       │ Partner │ Amount    │ Method        │ Notes     │
│ ────────────┼─────────┼───────────┼───────────────┼───────────│
│  Jan 25     │ 👩 Heli │ ₪10,000   │ Bank Transfer │ January   │
│  Jan 25     │ 👨 Shahar│ ₪10,000   │ Bank Transfer │ January   │
│  Jan 10     │ 👩 Heli │ ₪5,000    │ Bank Transfer │ Advance   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Partner Card Details

**Hero Number:**
- Font size: 56px (--text-hero)
- Color: Green if positive, Red if negative
- Format: ₪XX,XXX

**Breakdown (Accordion):**
- 50% Share of Profits: `(Total PAID invoices * partner_split_percent) - (Total Expenses / 2)`
- Company Owes Me: Sum of (private expenses for business * tax %)
- I Owe Company: Sum of (business expenses for personal benefit)
- Already Withdrawn: Sum of withdrawals

### Withdrawal Modal

```
┌─────────────────────────────────────────┐
│ Record Withdrawal - Heli             X  │
├─────────────────────────────────────────┤
│                                         │
│ Available: ₪16,500                      │
│                                         │
│ Amount          [         ] ILS         │
│                                         │
│ Date            [2026-01-25      📅]    │
│                                         │
│ Method          [Bank Transfer ▼]       │
│                                         │
│ Notes           [                    ]  │
│                                         │
│        [Cancel]      [Record Withdrawal]│
│                                         │
└─────────────────────────────────────────┘
```

---

## 7.7 Analytics Page (`/analytics`)

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Analytics                                   [Q1 ▼] [2026 ▼]   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Quarterly Performance                                    │  │
│  │                                                          │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ [Bar Chart: Income vs Expenses by Quarter]         │ │  │
│  │  │                                                     │ │  │
│  │  │   Q1        Q2        Q3        Q4                 │ │  │
│  │  │   ██        ██        ██        ██  <- Income      │ │  │
│  │  │   ▓▓        ▓▓        ▓▓        ▓▓  <- Expenses    │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌──────────────────────┐  ┌───────────────────────────────┐  │
│  │ Quarterly Metrics    │  │ Top 5 Clients                 │  │
│  │                      │  │                               │  │
│  │ Revenue: ₪45,000     │  │ 1. Acme Corp      ₪50,000    │  │
│  │ vs Q4 2025: +15%     │  │ 2. TechStart      ₪30,000    │  │
│  │                      │  │ 3. Global Sol.    ₪25,000    │  │
│  │ Gross Margin: 72%    │  │ 4. LegalEase      ₪20,000    │  │
│  │ Net Profit: ₪28,000  │  │ 5. DataFlow       ₪15,000    │  │
│  │                      │  │                               │  │
│  │ New Clients: 2       │  └───────────────────────────────┘  │
│  │ Avg Days to Pay: 18  │                                     │
│  └──────────────────────┘                                     │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Revenue by Line of Business                             │  │
│  │                                                          │  │
│  │  High-Tech    ████████████████████  65%   ₪97,500      │  │
│  │  Legal        ██████████           22%   ₪33,000      │  │
│  │  Marketing    █████                13%   ₪19,500      │  │
│  │                                                          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ COGS as % of Revenue                                    │  │
│  │                                                          │  │
│  │  Q1: 28%  |  Q2: 25%  |  Q3: 22%  |  Q4: --             │  │
│  │  [Line chart showing trend]                              │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Metrics Calculated

**Quarterly:**
- Revenue (sum of paid invoices in quarter)
- Revenue vs previous quarter (% change)
- Gross Margin % = (Revenue - COGS) / Revenue
- Net Profit = Revenue - All Expenses
- New clients (first invoice in this quarter)
- Average days to payment (due_date to date_paid)

**By LOB:**
- Sum of paid invoices grouped by client.lob

**Top Clients:**
- Ranked by total paid amount

---

## 7.8 Configuration Page (`/configuration`)

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│ Configuration                                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Categories] [Accounts] [Lines of Business]  <- Tabs         │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Categories                                   [+ Add Category] │
│  ──────────────────────────────────────────────────────────── │
│                                                                │
│  Name                    │ Parent    │ Tax %  │ Actions       │
│ ─────────────────────────┼───────────┼────────┼───────────────│
│  Software Licenses (Prod)│ COGS      │ 100%   │ [✎] [🗑]      │
│  Subcontractors          │ COGS      │ 100%   │ [✎] [🗑]      │
│  Marketing & Ads         │ OPEX      │ 100%   │ [✎] [🗑]      │
│  Home Office (Arnona)    │ OPEX      │ 25%    │ [✎] [🗑]      │
│  Car / Fuel              │ OPEX      │ 45%    │ [✎] [🗑]      │
│  ...                                                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Tabs Content

**Categories Tab:**
- Name, Parent Category (COGS/OPEX/Financial), Tax %, Description
- Add/Edit/Delete

**Accounts Tab:**
- Name, Type, Linked Partner (if private)
- Add/Edit/Delete

**Lines of Business Tab:**
- Name only
- Add/Edit/Delete

### Delete Validation

Before deleting, check if any records use this item:
- Categories: Check transactions
- Accounts: Check transactions
- LOB: Check clients
- Clients: Check invoices and transactions

If used, show error: "Cannot delete. Used by X records."

---

# 8. BUSINESS LOGIC

## 8.1 Partner Balance Calculation

```typescript
// lib/utils/calculations.ts

interface PartnerBalanceResult {
  partner_id: string;
  partner_name: string;
  year: number;
  breakdown: {
    total_company_income: number;      // All paid invoices
    partner_income_share: number;      // Based on split %
    total_expenses: number;            // All expenses (tax-adjusted)
    partner_expense_share: number;     // 50% of expenses
    base_profit_share: number;         // income_share - expense_share
    company_owes_partner: number;      // Private payments for business
    partner_owes_company: number;      // Business payments for personal
    fairness_adjustment: number;       // owes_partner - owes_company
    total_withdrawn: number;           // Sum of withdrawals
  };
  net_available: number;
}

async function calculatePartnerBalance(
  partnerId: string, 
  year: number
): Promise<PartnerBalanceResult> {
  
  const partner = await getPartner(partnerId);
  
  // STEP 1: Calculate Income Share
  // Get all PAID invoices for the year
  const paidInvoices = await getInvoices({ 
    year, 
    status: 'Paid' 
  });
  
  const totalIncome = paidInvoices.reduce((sum, inv) => sum + inv.amount_ils, 0);
  
  // Calculate partner's share based on split percentage per invoice
  const partnerIncomeShare = paidInvoices.reduce((sum, inv) => {
    const splitPercent = partner.name === 'Heli' 
      ? inv.heli_split_percent 
      : inv.shahar_split_percent;
    return sum + (inv.amount_ils * (splitPercent / 100));
  }, 0);
  
  // STEP 2: Calculate Expense Share
  // All expenses are split 50-50, but we use tax-adjusted amounts
  const allExpenses = await getTransactions({ 
    year, 
    deleted: false 
  });
  
  const totalExpenses = allExpenses.reduce((sum, txn) => {
    return sum + (txn.amount_ils * txn.applied_tax_percent);
  }, 0);
  
  const partnerExpenseShare = totalExpenses / 2;
  
  // STEP 3: Calculate Base Profit Share
  const baseProfitShare = partnerIncomeShare - partnerExpenseShare;
  
  // STEP 4: Fairness Adjustments
  
  // Company owes partner: Private account paid for Business beneficiary
  const privateForBusiness = allExpenses.filter(txn => 
    txn.account.type === 'Private_Credit' &&
    txn.account.partner_id === partnerId &&
    txn.beneficiary === 'Business'
  );
  
  const companyOwesPartner = privateForBusiness.reduce((sum, txn) => {
    return sum + (txn.amount_ils * txn.applied_tax_percent);
  }, 0);
  
  // Partner owes company: Business account paid for Partner beneficiary
  const businessForPartner = allExpenses.filter(txn => 
    (txn.account.type === 'Business_Credit' || txn.account.type === 'Bank_Transfer') &&
    txn.beneficiary === partner.name
  );
  
  const partnerOwesCompany = businessForPartner.reduce((sum, txn) => {
    return sum + txn.amount_ils; // Full amount, not tax-adjusted
  }, 0);
  
  const fairnessAdjustment = companyOwesPartner - partnerOwesCompany;
  
  // STEP 5: Withdrawals
  const withdrawals = await getWithdrawals({ 
    partner_id: partnerId, 
    year 
  });
  
  const totalWithdrawn = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  
  // FINAL CALCULATION
  const netAvailable = baseProfitShare + fairnessAdjustment - totalWithdrawn;
  
  return {
    partner_id: partnerId,
    partner_name: partner.name,
    year,
    breakdown: {
      total_company_income: totalIncome,
      partner_income_share: partnerIncomeShare,
      total_expenses: totalExpenses,
      partner_expense_share: partnerExpenseShare,
      base_profit_share: baseProfitShare,
      company_owes_partner: companyOwesPartner,
      partner_owes_company: partnerOwesCompany,
      fairness_adjustment: fairnessAdjustment,
      total_withdrawn: totalWithdrawn
    },
    net_available: netAvailable
  };
}
```

## 8.2 Currency Conversion

```typescript
// lib/utils/exchange-rate.ts

const EXCHANGE_API_URL = 'https://api.exchangerate-api.com/v4/latest/ILS';

async function getExchangeRate(
  date: string, 
  currency: 'USD' | 'EUR' | 'GBP'
): Promise<number> {
  
  // Check cache first
  const cached = await supabase
    .from('exchange_rates')
    .select('rate_to_ils')
    .eq('date', date)
    .eq('currency', currency)
    .single();
    
  if (cached.data) {
    return cached.data.rate_to_ils;
  }
  
  // Fetch from API
  const response = await fetch(EXCHANGE_API_URL);
  const data = await response.json();
  
  // API returns ILS as base, so we need inverse
  const rateFromILS = data.rates[currency];
  const rateToILS = 1 / rateFromILS;
  
  // Cache the result
  await supabase.from('exchange_rates').insert({
    date,
    currency,
    rate_to_ils: rateToILS,
    source: 'exchangerate-api'
  });
  
  return rateToILS;
}
```

## 8.3 Invoice Auto-Overdue

```typescript
// Run on page load or via cron
async function updateOverdueInvoices(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  
  await supabase
    .from('invoices')
    .update({ status: 'Overdue' })
    .eq('status', 'Sent')
    .lt('due_date', today)
    .is('deleted_at', null);
}
```

## 8.4 VAT Calculation

```typescript
// For display purposes
function calculateVATBreakdown(amount: number, includesVat: boolean, vatRate: number = 0.18) {
  if (includesVat) {
    const amountBeforeVat = amount / (1 + vatRate);
    const vatAmount = amount - amountBeforeVat;
    return {
      total: amount,
      beforeVat: amountBeforeVat,
      vat: vatAmount
    };
  } else {
    const vatAmount = amount * vatRate;
    return {
      total: amount + vatAmount,
      beforeVat: amount,
      vat: vatAmount
    };
  }
}
```

---

# 9. SEED DATA

## 9.1 Categories (Full List)

```sql
INSERT INTO categories (name, parent_category, tax_recognition_percent, description) VALUES
-- COGS (Cost of Goods Sold)
('Software Licenses (Production)', 'COGS', 1.0000, 'SaaS tools used directly for client work: n8n, OpenAI, Make, etc.'),
('Subcontractors', 'COGS', 1.0000, 'Freelancers hired for specific client projects'),
('Cloud Infrastructure', 'COGS', 1.0000, 'AWS, GCP, Vercel - production environments'),

-- OPEX (Operating Expenses)
('Marketing & Advertising', 'OPEX', 1.0000, 'Facebook Ads, Google Ads, LinkedIn, content marketing'),
('Professional Services', 'OPEX', 1.0000, 'Accountant, lawyer, business consulting'),
('Office Supplies', 'OPEX', 1.0000, 'Equipment, furniture, stationery'),
('Software Licenses (Internal)', 'OPEX', 1.0000, 'Tools for internal use: Notion, Slack, etc.'),
('Travel & Transportation', 'OPEX', 0.4500, 'Flights, hotels, client meetings - 45% recognized'),
('Car & Fuel', 'OPEX', 0.4500, 'Vehicle expenses - 45% recognized per Israeli tax law'),
('Communication', 'OPEX', 1.0000, 'Phone, internet - when primarily business use'),
('Home Office - Utilities', 'OPEX', 0.2500, 'Electricity, water - 25% recognized'),
('Home Office - Arnona', 'OPEX', 0.2500, 'Property tax - 25% recognized'),
('Personal Training / Coaching', 'OPEX', 1.0000, 'Business coaching, professional development'),
('Refreshments', 'OPEX', 0.8000, 'Coffee, snacks for office - 80% recognized'),
('Insurance', 'OPEX', 1.0000, 'Business insurance, liability'),
('Subscriptions & Memberships', 'OPEX', 1.0000, 'Professional associations, newsletters'),

-- Financial
('Bank Fees', 'Financial', 1.0000, 'Account fees, wire transfer fees'),
('Credit Card Fees', 'Financial', 1.0000, 'Annual fees, transaction fees'),
('Currency Exchange Loss', 'Financial', 1.0000, 'Losses from currency conversion');
```

## 9.2 Lines of Business

```sql
INSERT INTO lines_of_business (name) VALUES
('Retail'),
('Legal'),
('High-Tech'),
('Marketing & Advertising'),
('Healthcare'),
('Finance & Banking'),
('Education'),
('Real Estate'),
('Manufacturing'),
('Hospitality'),
('Non-Profit'),
('Government'),
('Other');
```

## 9.3 Partners

```sql
INSERT INTO partners (name, email, icon_color) VALUES
('Heli', 'heli@automationsflow.com', 'pink'),
('Shahar', 'shahar@automationsflow.com', 'blue');
```

## 9.4 Accounts

```sql
-- Get partner IDs first
WITH partner_ids AS (
  SELECT id, name FROM partners
)
INSERT INTO accounts (name, type, partner_id) VALUES
('Business Bank Account', 'Bank_Transfer', NULL),
('Heli Business Card', 'Business_Credit', NULL),
('Shahar Business Card', 'Business_Credit', NULL),
('Heli Private Card', 'Private_Credit', (SELECT id FROM partner_ids WHERE name = 'Heli')),
('Shahar Private Card', 'Private_Credit', (SELECT id FROM partner_ids WHERE name = 'Shahar'));
```

---

# 10. IMPLEMENTATION PHASES

## Phase 1: Foundation (Days 1-2)

### Tasks:
1. **Project Setup**
   - Initialize Next.js 14 project with TypeScript
   - Configure Tailwind CSS with custom design tokens
   - Install and configure shadcn/ui
   - Set up project structure (folders, files)

2. **Supabase Setup**
   - Create Supabase project
   - Run all SQL schema migrations
   - Insert seed data
   - Configure Row Level Security (RLS) policies

3. **Authentication**
   - Configure Google OAuth in Supabase
   - Create login page
   - Implement middleware for route protection
   - Add user whitelist check

### Deliverables:
- [ ] Working login with Google
- [ ] Database with all tables and seed data
- [ ] Protected routes

---

## Phase 2: Core Layout & Navigation (Day 3)

### Tasks:
1. **Layout Component**
   - Sidebar with navigation
   - Year selector dropdown
   - User profile section
   - Logo integration

2. **Shared Components**
   - Glass card component
   - Empty state component
   - Loading spinner
   - Currency display component
   - Partner icon component

### Deliverables:
- [ ] Complete app shell with sidebar
- [ ] Navigation between all pages (empty)
- [ ] Year selector working

---

## Phase 3: Expenses Module (Days 4-5)

### Tasks:
1. **API Routes**
   - GET /api/transactions (with filtering)
   - POST /api/transactions
   - PATCH /api/transactions/[id]
   - DELETE /api/transactions/[id]
   - GET /api/exchange-rate

2. **UI Components**
   - Expense table with all columns
   - Search functionality
   - Add expense modal
   - Edit expense modal
   - Delete confirmation

3. **Logic**
   - Auto-fetch exchange rate on currency change
   - Auto-fill tax % from category
   - Infinite scroll or pagination

### Deliverables:
- [ ] Full CRUD for expenses
- [ ] Currency conversion working
- [ ] Search working

---

## Phase 4: Invoices Module (Days 6-7)

### Tasks:
1. **API Routes**
   - GET /api/invoices (with status grouping)
   - POST /api/invoices
   - PATCH /api/invoices/[id]
   - DELETE /api/invoices/[id]

2. **UI Components**
   - Status summary cards
   - Grouped invoice list
   - Invoice card component
   - Add/Edit invoice modal
   - Mark as paid action

3. **Logic**
   - Auto-update overdue status
   - Split percentage validation
   - VAT toggle

### Deliverables:
- [ ] Full CRUD for invoices
- [ ] Status grouping working
- [ ] Auto-overdue detection

---

## Phase 5: Clients Module (Day 8)

### Tasks:
1. **API Routes**
   - CRUD for /api/clients
   - Include invoice stats in GET

2. **UI Components**
   - Client table with stats
   - Add/Edit client modal
   - Delete with validation

### Deliverables:
- [ ] Full CRUD for clients
- [ ] Invoice stats displayed

---

## Phase 6: Partner Balance Module (Days 9-10)

### Tasks:
1. **API Routes**
   - GET /api/partners/[id]/balance
   - CRUD for /api/withdrawals

2. **UI Components**
   - Partner balance cards (hero numbers)
   - Breakdown accordion
   - Withdrawal modal
   - Withdrawal history table

3. **Logic**
   - Complete balance calculation algorithm
   - Display positive/negative correctly

### Deliverables:
- [ ] Partner balance calculation working
- [ ] Withdrawal recording working
- [ ] History displayed

---

## Phase 7: Dashboard (Day 11)

### Tasks:
1. **API**
   - Aggregate data endpoint (or calculate client-side)

2. **UI Components**
   - Stats cards (Income, COGS, OPEX, Margin, Profit)
   - Partner balance mini widget
   - Open invoices alert

### Deliverables:
- [ ] All dashboard metrics displayed
- [ ] Real-time data from DB

---

## Phase 8: Analytics (Day 12)

### Tasks:
1. **API**
   - Quarterly aggregation endpoint
   - LOB breakdown endpoint
   - Top clients endpoint

2. **UI Components**
   - Quarter selector
   - Bar chart for quarterly performance
   - LOB breakdown chart
   - Top clients list
   - Key metrics cards

### Deliverables:
- [ ] All analytics charts working
- [ ] Quarter filtering working

---

## Phase 9: Configuration (Day 13)

### Tasks:
1. **UI Components**
   - Tabbed interface
   - Categories table with CRUD
   - Accounts table with CRUD
   - LOB table with CRUD

2. **Logic**
   - Delete validation

### Deliverables:
- [ ] Full configuration management
- [ ] Delete protection working

---

## Phase 10: Polish & Testing (Days 14-15)

### Tasks:
1. **UI Polish**
   - Responsive design check (mobile for tables)
   - Loading states everywhere
   - Error handling
   - Empty states

2. **Testing**
   - Test partner balance with various scenarios
   - Test currency conversion
   - Test all CRUD operations
   - Test auth flow

3. **Deployment**
   - Deploy to Vercel
   - Configure production Supabase
   - Set environment variables
   - Test production

### Deliverables:
- [ ] Production deployment
- [ ] All features working
- [ ] Mobile-friendly tables

---

# 🚀 READY TO BUILD

This Implementation Plan contains everything needed to build Sunny from scratch:

- ✅ Complete database schema with all tables
- ✅ All API endpoints defined
- ✅ Full authentication flow
- ✅ Detailed design system
- ✅ Page-by-page specifications
- ✅ Business logic formulas
- ✅ Seed data ready
- ✅ Phased implementation plan

**Start with Phase 1 and build incrementally. Each phase builds on the previous one.**

Good luck! 🌅

---

# 11. DEPLOYMENT & CONFIGURATION LOG

## 11.1 GitHub Repository

**Repository:** https://github.com/heli-gil/sunny
**Branch:** main

### Setup Steps:
1. Install GitHub CLI: `brew install gh`
2. Authenticate: `gh auth login`
3. Create repo and push: `gh repo create sunny --public --source=. --push`

---

## 11.2 Vercel Deployment

**Production URLs:**
- https://sunny-git-main-automation-flows-projects.vercel.app
- https://sunny-fpwb7brgn-automation-flows-projects.vercel.app

### Environment Variables Required on Vercel:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://liedsrqsodclsvbsxuqc.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (single line, no spaces!) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (single line, no spaces!) |

**IMPORTANT:** When pasting keys in Vercel, ensure they are a single line with NO spaces or line breaks. Invalid header errors occur if keys contain whitespace.

---

## 11.3 Route Structure Fix

**Issue:** Vercel build failed with `ENOENT: page_client-reference-manifest.js` error.

**Cause:** Route conflict - both `app/page.tsx` and `app/(dashboard)/page.tsx` were trying to serve the `/` route (route groups don't add to URL path).

**Solution:**
1. Moved `app/(dashboard)/page.tsx` → `app/(dashboard)/dashboard/page.tsx`
2. Updated `app/page.tsx` to redirect to `/dashboard`:
```typescript
import { redirect } from 'next/navigation'

export default function Home() {
  redirect('/dashboard')
}
```

---

## 11.4 Google OAuth Setup

### Supabase Configuration:
1. **Authentication → Providers → Google** - Enable and add Client ID + Secret
2. **Authentication → URL Configuration:**
   - Site URL: `https://sunny-git-main-automation-flows-projects.vercel.app`
   - Redirect URLs: `https://sunny-git-main-automation-flows-projects.vercel.app/**`

### Google Cloud Console:
1. Create project at https://console.cloud.google.com
2. Configure OAuth consent screen (External)
3. Create OAuth 2.0 Client ID (Web application)
4. Add Authorized JavaScript origins:
   - `https://sunny-git-main-automation-flows-projects.vercel.app`
5. Add Authorized redirect URIs:
   - `https://liedsrqsodclsvbsxuqc.supabase.co/auth/v1/callback`

---

## 11.5 Auth Callback Error Handling

Enhanced `app/auth/callback/route.ts` to show detailed error messages:

```typescript
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error_param = searchParams.get('error')
  const error_description = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  // Check for OAuth errors from Supabase
  if (error_param) {
    console.error('OAuth error:', error_param, error_description)
    return NextResponse.redirect(`${origin}/login?error=auth_failed&details=${encodeURIComponent(error_description || error_param)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('Exchange code error:', error.message)
    return NextResponse.redirect(`${origin}/login?error=auth_failed&details=${encodeURIComponent(error.message)}`)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed&details=no_code`)
}
```

---

## 11.6 Files Changed During Deployment

| File | Change |
|------|--------|
| `app/page.tsx` | Changed to redirect to `/dashboard` |
| `app/(dashboard)/dashboard/page.tsx` | Moved from `app/(dashboard)/page.tsx` |
| `app/auth/callback/route.ts` | Added detailed error logging |
| `app/(auth)/login/page.tsx` | Shows error details from callback |
| `vercel.json` | Created for Vercel configuration |
| `.mcp.json` | Contains MCP server configs (in .gitignore) |

---

## 11.7 Troubleshooting

### "Invalid header value" Error
**Cause:** Environment variables on Vercel contain line breaks or spaces
**Fix:** Delete and re-add the variable, pasting as a single line

### "Provider not enabled" Error
**Cause:** Google OAuth not enabled in Supabase
**Fix:** Enable in Supabase → Authentication → Providers → Google

### Redirect to localhost:3000
**Cause:** Supabase Site URL not configured for production
**Fix:** Update Site URL in Supabase → Authentication → URL Configuration

### Build Failed (route group error)
**Cause:** Conflicting page.tsx files at same route
**Fix:** Ensure only one page.tsx serves each route path

---

# 12. API ROUTES IMPLEMENTATION

## 12.1 Implemented API Routes

All CRUD API routes are now implemented:

| Route | Methods | Description |
|-------|---------|-------------|
| `/api/partners` | GET | List all partners |
| `/api/categories` | GET, POST | List/create expense categories |
| `/api/accounts` | GET, POST | List/create payment accounts |
| `/api/lob` | GET, POST | List/create lines of business |
| `/api/clients` | GET, POST | List/create clients (includes invoice stats) |
| `/api/clients/[id]` | PATCH, DELETE | Update/delete client |
| `/api/transactions` | GET, POST | List/create expenses (year filter) |
| `/api/transactions/[id]` | PATCH, DELETE | Update/soft-delete expense |
| `/api/invoices` | GET, POST | List/create invoices (auto-updates overdue) |
| `/api/invoices/[id]` | PATCH, DELETE | Update/soft-delete invoice |
| `/api/withdrawals` | GET, POST | List/create partner withdrawals |
| `/api/withdrawals/[id]` | DELETE | Soft-delete withdrawal |
| `/api/seed` | POST | Seed database with mock data |

## 12.2 API Features

- **Soft Deletes**: Transactions, invoices, and withdrawals use soft delete (set `deleted_at`)
- **Auto Overdue**: Invoice GET automatically marks overdue invoices
- **Exchange Rates**: Transactions/invoices with non-ILS currency use hardcoded rates (USD: 3.65, EUR: 3.95, GBP: 4.55)
- **Tax Auto-fill**: Transaction POST auto-fills `applied_tax_percent` from category if not provided
- **Invoice Stats**: Client GET includes computed stats (total_invoiced, total_paid, etc.)

---

# 13. FRONTEND FORMS IMPLEMENTATION

## 13.1 Updated Pages with Working Forms

All pages now have working Add dialogs:

### Configuration Page (`/configuration`)
- **Categories Tab**: Add category with name, parent category (COGS/OPEX/Financial), tax %
- **Accounts Tab**: Add account with name, type, optional partner (for Private_Credit)
- **LOB Tab**: Add line of business with name
- All tabs show data tables with real-time loading from API

### Clients Page (`/clients`)
- **Add Client Dialog**: Name, contact info, LOB dropdown, status
- **Table**: Shows client name, contact, LOB badge, invoiced total, paid total
- Stats computed from invoice data

### Expenses Page (`/expenses`)
- **Add Expense Dialog**: Date, supplier, amount, currency, category, account, beneficiary, tax %, notes
- **Search**: Filter by supplier name or notes
- **Table**: Account, date, category badge, supplier, beneficiary, amount (ILS + original currency)
- Auto-fills tax % when category is selected

### Invoices Page (`/invoices`)
- **Add Invoice Dialog**: Invoice #, client, description, amount, currency, VAT checkbox, dates, status, split %
- **Summary Cards**: Overdue (red), Sent (blue), Paid (green) with counts and totals
- **Grouped Lists**: Invoices grouped by status with mark-as-paid button
- Split % auto-calculates (Heli + Shahar = 100%)

## 13.2 Common Form Features

- All forms use `'use client'` directive
- State management with `useState` hooks
- Toast notifications via `sonner` for success/error
- Loading states while fetching data
- Empty states when no data exists
- Form validation before submission

---

# 14. DATABASE SEED DATA

## 14.1 Seed Endpoint

**Endpoint**: `POST /api/seed`

**Usage** (after deployment):
```bash
curl -X POST https://sunny-git-main-automation-flows-projects.vercel.app/api/seed
```

Or in browser console:
```javascript
fetch('/api/seed', { method: 'POST' }).then(r => r.json()).then(console.log)
```

## 14.2 Mock Data Created

| Entity | Count | Details |
|--------|-------|---------|
| Partners | 2 | Heli (pink), Shahar (blue) |
| Categories | 14 | COGS (3), OPEX (9), Financial (2) |
| Accounts | 5 | Business Bank, 2 Business Cards, 2 Private Cards |
| Lines of Business | 8 | High-Tech, Legal, Retail, etc. |
| Clients | 5 | Acme Corp, TechStart Ltd, LegalEase, RetailMax, DataFlow |
| Invoices | 7 | 3 Paid, 2 Sent, 1 Overdue, 1 Draft |
| Transactions | 10 | Various categories and currencies |
| Withdrawals | 3 | 2 for Heli, 1 for Shahar |

## 14.3 Sample Invoices

| Invoice # | Client | Amount | Status |
|-----------|--------|--------|--------|
| INV-2026-001 | Acme Corp | ₪15,000 | Paid |
| INV-2026-002 | TechStart Ltd | ₪25,000 | Paid |
| INV-2026-003 | LegalEase | ₪8,000 | Paid |
| INV-2026-004 | RetailMax | ₪20,000 | Sent |
| INV-2026-005 | DataFlow Systems | ₪12,000 | Sent |
| INV-2026-006 | Acme Corp | ₪5,000 | Overdue |
| INV-2026-007 | TechStart Ltd | ₪30,000 | Draft |

## 14.4 Sample Expenses

| Date | Supplier | Amount | Category |
|------|----------|--------|----------|
| Jan 5 | OpenAI | $20 | Software (COGS) |
| Jan 5 | n8n Cloud | $50 | Software (COGS) |
| Jan 8 | Facebook Ads | ₪500 | Marketing (OPEX) |
| Jan 18 | Freelance Developer | ₪3,000 | Subcontractors (COGS) |
| Jan 20 | Accountant | ₪800 | Professional Services (OPEX) |

---

# 15. DASHBOARD, PARTNERS & ANALYTICS IMPLEMENTATION

## 15.1 Dashboard Page (`/dashboard`)

**Status:** IMPLEMENTED

### API Route: `/api/dashboard`

Returns comprehensive financial metrics for the selected year:

```typescript
// Response structure
{
  data: {
    totalIncome: number,      // Sum of paid invoices
    cogs: number,             // Expenses with COGS category
    opex: number,             // Expenses with OPEX category
    financial: number,        // Expenses with Financial category
    totalExpenses: number,    // Sum of all expenses
    grossProfit: number,      // Income - COGS
    grossMargin: number,      // (Income - COGS) / Income * 100
    netProfit: number,        // Income - All Expenses
    partners: {
      heli: { earnings, withdrawals, available },
      shahar: { earnings, withdrawals, available }
    },
    partnerDifference: number,  // Heli.available - Shahar.available
    openInvoices: {
      count, total, overdueCount, overdueTotal
    }
  }
}
```

### Dashboard UI Components:
- **Key Metrics Row**: Total Income (green), COGS (red), OPEX (cyan), Gross Margin (purple)
- **Secondary Metrics Row**: Net Profit, Partner Balance, Open Invoices
- **Partner Summary Cards**: Heli and Shahar cards showing earnings, withdrawn, available

---

## 15.2 Partners Page (`/partners`)

**Status:** IMPLEMENTED

### Features:
- **Partner Balance Cards**: Large hero numbers showing available to withdraw
- **Breakdown Details**: Earnings, withdrawn amounts
- **Record Withdrawal Dialog**: Partner selection, amount, date, method, notes
- **Withdrawal History Table**: Date, partner, amount, method, notes

### Withdrawal Form Fields:
| Field | Type | Notes |
|-------|------|-------|
| Partner | Select | Shows available balance in dropdown |
| Amount | Number | Required |
| Date | Date | Defaults to today |
| Method | Select | Bank_Transfer, Cash, Check |
| Notes | Text | Optional |

---

## 15.3 Analytics Page (`/analytics`)

**Status:** IMPLEMENTED

### API Route: `/api/analytics`

Returns chart data for visualizations:

```typescript
{
  data: {
    monthlyData: [{ month, income, expenses, profit }],
    categoryData: [{ name, value }],
    parentCategoryData: [{ name, value, color }],
    clientData: [{ name, value }],
    summary: {
      totalIncome, totalExpenses, netProfit,
      avgMonthlyIncome, avgMonthlyExpenses
    }
  }
}
```

### Charts Implemented (using Recharts):
1. **Monthly Income vs Expenses** - Bar chart comparing income and expenses by month
2. **Profit Trend** - Line chart showing net profit over time
3. **Expenses by Type** - Pie chart (COGS/OPEX/Financial distribution)
4. **Top Expense Categories** - Horizontal bar chart of top 6 categories
5. **Income by Client** - Pie chart showing revenue per client

### Dependencies Added:
```bash
npm install recharts
```

---

# 16. DATABASE SCHEMA SETUP

## 16.1 Schema File Location

**File:** `supabase/schema.sql`

This file must be run in Supabase SQL Editor before the app can function.

### Tables Created:
- `partners` - Heli and Shahar
- `accounts` - Payment accounts (business/private)
- `categories` - Expense categories with tax recognition
- `lines_of_business` - Client industry sectors
- `clients` - Customer information
- `transactions` - Expenses with multi-currency support
- `invoices` - Revenue tracking with split percentages
- `withdrawals` - Partner withdrawal records
- `exchange_rates` - Cached currency rates

### ENUMs Defined:
- `account_type`: Business_Credit, Private_Credit, Bank_Transfer
- `parent_category`: COGS, OPEX, Financial
- `currency_code`: ILS, USD, EUR, GBP
- `beneficiary_type`: Business, Heli, Shahar
- `invoice_status`: Draft, Sent, Overdue, Paid
- `client_status`: Active, Inactive
- `withdrawal_method`: Bank_Transfer, Cash, Check

### Computed Columns:
- `transactions.amount_ils` - Auto-calculated from amount * exchange_rate_to_ils
- `invoices.amount_ils` - Auto-calculated from amount * exchange_rate_to_ils

---

# 17. REMAINING WORK

## 17.1 Not Yet Implemented

- [ ] Edit functionality for existing records
- [ ] Delete functionality with confirmation dialogs
- [ ] Year selector in sidebar (currently hardcoded to 2026)
- [ ] Real exchange rate API integration
- [ ] Mobile responsive improvements
- [ ] Loading skeletons instead of "Loading..." text

## 17.2 Known Limitations

- Exchange rates are hardcoded (USD: 3.65, EUR: 3.95, GBP: 4.55)
- Year filter is hardcoded to 2026 in API calls
- Partner balance calculation simplified (doesn't include company owes/partner owes adjustments)

## 17.3 Setup Instructions

1. **Create database tables:**
   - Open Supabase SQL Editor
   - Paste contents of `supabase/schema.sql`
   - Run the SQL

2. **Seed mock data:**
   ```javascript
   // In browser console on deployed site
   fetch('/api/seed', { method: 'POST' }).then(r => r.json()).then(console.log)
   ```

3. **Verify pages load:**
   - Dashboard: `/dashboard`
   - Expenses: `/expenses`
   - Invoices: `/invoices`
   - Clients: `/clients`
   - Partners: `/partners`
   - Analytics: `/analytics`
   - Configuration: `/configuration`

---

# 18. CHANGE LOG

## 2026-01-30 - Number Input Arrows & Categories Update

### Changes Made:
- Removed +/- spinner arrows from all number input fields via CSS
- Added 'Mixed' parent category for Israeli tax law compliance
- Added orange color scheme for Mixed category
- Updated expenses page to show category as: [Tag] Name format
- Created SQL script for production categories with Hebrew descriptions

### Files Modified:
- `app/globals.css` - Added CSS to hide number input spinners, added badge-mixed class
- `tailwind.config.ts` - Added mixed color (orange)
- `app/(dashboard)/expenses/page.tsx` - Updated category display in table and dropdown

### Files Created:
- `supabase/update_categories.sql` - Production categories with Israeli tax law values

### Notes:
- Schema change required: `ALTER TYPE parent_category ADD VALUE 'Mixed'`
- Run `update_categories.sql` in Supabase SQL Editor for production data
- 19 categories total: COGS (3), OPEX (9), Mixed (5), Financial (2)

---

## 2026-01-30 - CLAUDE.md Auto-Instructions File

### Changes Made:
- Created `CLAUDE.md` in project root for automatic context loading
- Claude Code reads this file at session start automatically

### Files Created:
- `CLAUDE.md` - Project instructions for Claude

### Notes:
- This ensures hooks workflow is followed in every new session
- No need to remind Claude to read hooks manually

---

## 2026-01-30 - Dashboard, Partners & Analytics Implementation

### Changes Made:
- Implemented Dashboard page with real-time financial metrics
- Implemented Partners page with withdrawal functionality
- Implemented Analytics page with interactive charts (Recharts)
- Created API routes: `/api/dashboard`, `/api/analytics`
- Fixed TypeScript errors in analytics page (Tooltip formatter types)
- Added recharts dependency for data visualization

### Files Created:
- `app/api/dashboard/route.ts` - Dashboard stats API
- `app/api/analytics/route.ts` - Analytics data API

### Files Modified:
- `app/(dashboard)/dashboard/page.tsx` - Full implementation with stats cards
- `app/(dashboard)/partners/page.tsx` - Full implementation with withdrawal dialog
- `app/(dashboard)/analytics/page.tsx` - Charts with Recharts library
- `package.json` - Added recharts dependency

### Notes:
- Recharts Tooltip formatter requires handling undefined values
- Pie chart labels need nullish coalescing for percent values
- All pages now fetch real data from Supabase
- Build passes successfully with `npm run build`

---

## 2026-01-30 - Database Schema & Categories Setup (Production)

### Changes Made:
- Applied full database schema to Supabase production via MCP
- Added 'Mixed' to parent_category enum (COGS, OPEX, Mixed, Financial)
- Seeded 19 categories with Israeli Tax Law 2026 compliance:
  - **COGS (3)**: Software Licenses, Subcontractors, Servers & Cloud
  - **OPEX (9)**: Marketing, SaaS Tools, Professional Services, Office Supplies, Refreshments (80%), Business Gifts, Professional Training, Business Meals Foreign (100%), Business Meals Local (0%)
  - **Mixed (5)**: Home Office Arnona (25%), Home Office Utilities (25%), Communication (100%), Vehicle (45%), Travel Abroad (100%)
  - **Financial (2)**: Bank Fees (100%), Fines & Penalties (0%)
- Updated TypeScript types to include 'Mixed' in ParentCategory
- Updated local schema.sql to match production

### Files Modified:
- `types/index.ts` - Added 'Mixed' to ParentCategory type
- `supabase/schema.sql` - Added 'Mixed' to parent_category enum

### Supabase Migrations Applied:
- `create_initial_schema` - Full database schema with all tables
- `seed_categories` - 19 categories with Hebrew descriptions

### Notes:
- Expenses form already implements [ParentCategory] + CategoryName dropdown pattern
- Color coding: COGS=red, OPEX=cyan, Mixed=orange, Financial=purple
- Tax recognition percentages are auto-filled when category is selected
- Build passes successfully

---

## 2026-01-30 - UI Icons & Partner Colors + Seed Data

### Changes Made:
- Seeded partners table (Heli, Shahar)
- Seeded accounts table (5 accounts: Business Bank, Heli/Shahar Business Cards, Heli/Shahar Private Cards)
- Seeded lines_of_business table (9 LOBs)
- Updated expenses page with improved UI:
  - Category dropdown: Solid colored tags (COGS=red, OPEX=cyan, Mixed=orange, Financial=purple)
  - Payment Account dropdown: Icons with partner colors (pink for Heli, blue for Shahar, cyan for Business)
  - Beneficiary dropdown: Icons with partner colors
  - Table view: Consistent icons and colored names

### Partner Color System:
- Heli: #ff6b9d (Pink)
- Shahar: #5ac8fa (Blue)
- Business: #64d2ff (Cyan)

### Account Icons:
- Bank_Transfer: Building2 icon
- Business_Credit: CreditCard icon
- Private_Credit: Wallet icon

### Files Modified:
- `app/(dashboard)/expenses/page.tsx` - Enhanced UI with icons and partner colors

### Supabase Migration Applied:
- `seed_partners_and_accounts` - Partners, Accounts, Lines of Business

### Notes:
- Payment account dropdown now populated with 5 accounts
- Build passes successfully

---

## 2026-01-31 - Icons & Colors for LOB + Configuration UI Enhancements

### Changes Made:
- Fixed expenses page bug: changed hardcoded `year=2026` to dynamic `new Date().getFullYear()`
- Added icon/icon_color support to Accounts and Lines of Business:
  - Added icon and icon_color columns to TypeScript types
  - API routes now handle icon/icon_color in POST and PATCH operations
- Enhanced Configuration page:
  - Accounts table displays icons with customizable colors
  - LOB table displays icons with customizable colors
  - Add/Edit dialogs for both Accounts and LOB now include icon and color selectors
  - Icon options: CreditCard, Building2, Wallet, Banknote, PiggyBank, CircleDollarSign, Briefcase, ShoppingBag, Scale, Cpu, Megaphone, Heart, Landmark, GraduationCap, Building
  - Color options: Pink, Blue, Cyan, Green, Orange, Purple, Red, Yellow, Gray
- Updated Clients page:
  - LOB badges now display with each LOB's unique icon and color (instead of hardcoded purple)
  - Added dynamic icon rendering using ICON_MAP lookup

### Files Modified:
- `types/index.ts` - Added icon/icon_color to Account and LineOfBusiness interfaces
- `app/(dashboard)/configuration/page.tsx` - Full UI update with icon/color editing
- `app/(dashboard)/clients/page.tsx` - Dynamic LOB icon and color display
- `app/(dashboard)/expenses/page.tsx` - Fixed dynamic year calculation
- `app/api/accounts/route.ts` - Added icon/icon_color to POST
- `app/api/accounts/[id]/route.ts` - Added icon/icon_color to PATCH
- `app/api/lob/route.ts` - Added icon/icon_color to POST
- `app/api/lob/[id]/route.ts` - Added icon/icon_color to PATCH

### Supabase Migrations Applied:
- `add_icon_columns_to_accounts` - Added icon/icon_color to accounts table
- `add_icon_columns_to_lob` - Added icon/icon_color to lines_of_business table

### Notes:
- Build passes successfully
- TypeScript type check passes
- Pushed to production (Vercel)

---

## 2026-01-31 - Recurring Expenses Feature + Bug Fixes

### Bug Fixes:
- **Expenses not showing in UI**: Added year selector with "All Time" option to fix 2025 expenses not showing
- **Created by tracking**: API now joins `created_by` with partners table, UI displays "Added By" column with partner colors

### Major Changes - Rename transactions → expenses:
- Database table renamed from `transactions` to `expenses`
- API routes renamed from `/api/transactions` to `/api/expenses`
- TypeScript types: `Transaction` → `Expense` (with backwards compatibility alias)

### Recurring Expenses Feature:
- **New table**: `recurring_expenses` for storing recurring templates
- **New API routes**:
  - GET/POST `/api/recurring-expenses` - List/create recurring expenses
  - GET/PATCH/DELETE `/api/recurring-expenses/[id]` - Individual recurring expense operations
  - GET/POST `/api/cron/process-recurring` - Daily cron endpoint
- **UI Changes**:
  - Checkbox "Recurring Expense" in Add Expense modal
  - Day of Month (1-31) field when recurring is checked
  - Optional End Date field
  - Repeat icon (🔄) in expenses table for recurring items
- **Cron**: Vercel cron configured to run daily at 6AM

### Files Created:
- `app/api/recurring-expenses/route.ts`
- `app/api/recurring-expenses/[id]/route.ts`
- `app/api/cron/process-recurring/route.ts`

### Files Modified:
- `app/api/expenses/route.ts` (renamed from transactions, handles recurring)
- `app/api/expenses/[id]/route.ts` (renamed from transactions)
- `app/(dashboard)/expenses/page.tsx` - Year selector, Added By column, recurring checkbox
- `types/index.ts` - Expense, RecurringExpense types
- `vercel.json` - Added cron configuration

### Supabase Migrations Applied:
- `rename_transactions_to_expenses` - Renamed table and indexes
- `add_recurring_expenses` - Created recurring_expenses table, added recurring_expense_id to expenses

### Notes:
- Build passes successfully
- Cron requires Vercel Pro plan (can also be triggered manually via GET/POST)
- n8n can call PATCH `/api/expenses/[id]` to update invoice_url field

---

## 2026-01-31 - Edit/Delete Buttons + Dynamic Year Filter

### New Features:
- **Edit/Delete buttons in expenses table**: Added Actions column with Pencil and Trash2 icons
- **Edit Expense modal**: Pre-populated form with all expense fields
- **Delete confirmation dialog**: Shows expense details before confirming deletion
- **Dynamic year filter**: Year dropdown now shows only years that have expenses in the database (instead of hardcoded list)

### Files Created:
- `app/api/expenses/years/route.ts` - Returns list of unique years from expenses table

### Files Modified:
- `app/(dashboard)/expenses/page.tsx`:
  - Added Pencil, Trash2, DialogDescription, DialogFooter imports
  - Added edit/delete state: editDialogOpen, deleteDialogOpen, editingExpense, deletingExpense, editForm
  - Added openEditDialog(), handleEditExpense(), handleDeleteExpense(), handleEditCategoryChange() functions
  - Added Actions column header and buttons in table rows
  - Added Edit Expense dialog with full form
  - Added Delete confirmation dialog
  - Year selector now fetches available years from `/api/expenses/years` endpoint

### Notes:
- Build passes successfully
- Soft delete pattern maintained (DELETE endpoint sets deleted_at)
- Edit modal matches Add Expense modal styling

---

## 2026-01-31 - Color System Updates

### Changes:
1. **Business color changed to purple**: Updated from cyan (#64d2ff) to purple (#bf5af2)
2. **Icons only colored, text remains white**: Partner/beneficiary names now use default text color
3. **Auto-set created_by**: API now automatically captures authenticated user when adding expenses

### Color Scheme (Final):
- **Heli**: Pink (#ff6b9d) - icons only
- **Shahar**: Blue (#5ac8fa) - icons only
- **Business**: Purple (#bf5af2) - icons only
- Text labels remain in default white/foreground color

### Files Modified:
- `app/(dashboard)/expenses/page.tsx` - Removed colored text from beneficiary and creator names
- `app/(dashboard)/dashboard/page.tsx` - Removed colored text from partner card titles
- `app/(dashboard)/partners/page.tsx` - Removed colored text from partner names in dropdowns and tables
- `app/(dashboard)/configuration/page.tsx` - Updated default color to purple
- `app/globals.css` - Updated --color-business to purple
- `tailwind.config.ts` - Updated business color to purple
- `app/api/expenses/route.ts` - Auto-set created_by from authenticated user
- `app/api/accounts/route.ts` - Updated default icon_color to purple
- `app/api/lob/route.ts` - Updated default icon_color to purple

### Database Updates:
- Updated all existing expenses with `created_by = NULL` to Heli's partner ID

---

## 2026-01-31 - Real-Time Exchange Rates

### Changes:
- Replaced hardcoded exchange rates with real-time API fetching
- Exchange rates are now fetched for the **specific transaction date**

### New File Created:
- `lib/exchange-rates.ts` - Exchange rate utility with:
  - **Primary API**: exchangerate.host (free, no API key required)
  - **Fallback API**: Frankfurter API (uses ECB data)
  - **Last resort**: Hardcoded fallback rates
  - **Caching**: In-memory cache with 24-hour TTL to reduce API calls

### Files Modified:
- `app/api/expenses/route.ts` - Fetches rate for transaction date
- `app/api/invoices/route.ts` - Fetches rate for invoice issue date
- `app/api/cron/process-recurring/route.ts` - Fetches rate for today's date

### How It Works:
```typescript
// Usage example
import { getExchangeRate } from '@/lib/exchange-rates'

const rate = await getExchangeRate('USD', '2026-01-15')
// Returns: ~3.65 (actual rate for that date)
```

### Supported Currencies:
USD, EUR, GBP, CHF, CAD, AUD, JPY (and any other supported by the API)

---

# 19. DEVELOPMENT WORKFLOW (CLAUDE_HOOKS)

## Pre-Task Checklist:
1. Read frontend-design skill (for UI work)
2. Read this implementation plan for project context

## Post-Task Checklist:
1. Run `npx tsc --noEmit` - TypeScript validation
2. Run `npm run build` - Full build verification
3. Update this document with changes made

## Architecture Rules (Non-Negotiable):
- Soft delete only (`deleted_at` timestamp)
- Always filter `deleted_at IS NULL` in queries
- React state with useState for client components
- Single source of truth: this implementation plan

---

## 2026-02-01 - Partner Current Account (Jeru) Implementation

### Changes:
Complete rewrite of partner financial calculations to implement the "Partner Current Account" (Jeru) system.

### New Partner Card Structure:
```
┌─────────────────────────────────────────┐
│ PROFIT SHARING                          │
│ Your Share of Revenue      ₪10,000     │  ← From invoice splits
│ Your Share of Costs        -₪5,000     │  ← 50% of ALL expenses
│ Your Share of Profits       ₪5,000     │
├─────────────────────────────────────────┤
│ CURRENT ACCOUNT                         │
│ Out-of-Pocket (Reimburse)   +₪200      │  ← Private card for Business
│ Benefits Received (Draws)   -₪1,500    │  ← Business paid for partner
│ Current Account Balance     -₪1,300    │
│ vs Shahar: -₪1,000                     │  ← Fairness comparison
├─────────────────────────────────────────┤
│ Already Withdrawn           -₪2,000    │
│ Net Available               ₪1,700     │  ← Profits + Current - Withdrawn
└─────────────────────────────────────────┘
```

### Calculation Logic:

**Revenue per Partner** (varies based on invoice splits):
```
Partner Revenue = Σ(paid_invoice.net_amount × partner_split_percent / 100)
```
Note: Uses net amount (excludes VAT) for revenue calculations.

**Costs per Partner** (always 50-50):
```
Partner Costs = Total ALL Expenses ÷ 2
```

**Out-of-Pocket** (Business owes partner):
```
WHERE account.partner_id = partner_id AND beneficiary = 'Business'
→ Partner paid from PRIVATE card for BUSINESS expense
```

**Benefits Received** (Partner draws from business):
```
WHERE beneficiary = partner_name
→ ANY expense marked for partner's personal benefit
```

**Current Account Balance**:
```
Current Account = Out-of-Pocket - Benefits Received
Positive = Business owes partner
Negative = Partner has drawn more than owed
```

**Net Available**:
```
Net Available = Profits + Current Account Balance - Already Withdrawn
```

### Files Modified:
- `app/api/dashboard/route.ts`:
  - Changed from `transactions` to `expenses` table
  - Added join with `accounts` table to get partner_id
  - Calculates revenue from invoice splits (not 50-50)
  - Calculates costs as 50% of all expenses
  - Calculates out-of-pocket vs benefits received
  - Calculates fairness imbalance between partners
  - Returns new data structure with all breakdown fields

- `app/(dashboard)/partners/page.tsx`:
  - Updated PartnerData interface with new fields
  - PartnerCard now shows sectioned breakdown:
    - Profit Sharing (Revenue, Costs, Profits)
    - Current Account (Out-of-Pocket, Benefits, Balance)
    - Fairness comparison ("vs Other Partner")
    - Withdrawals
    - Net Available (large, colored text)

### Verification:
- TypeScript check: ✅ Passed
- Build: ✅ Passed

### Notes:
- Revenue is split per invoice (can be different % per invoice)
- Costs are always split 50-50 regardless of who paid or benefited
- Fairness line shows how much more/less you drew compared to other partner
- Negative "vs Partner" (red) = you drew more benefits
- Positive "vs Partner" (green) = you drew less benefits

---

## 2026-02-01 - Expenses Summary Cards & Currency Formatting Fix

### Changes:

**1. Expenses Page Summary Cards**
Added two summary cards above the filters on the Expenses page:
- **Year Total**: Shows total expenses for the selected year (respects year filter) with expense count
- **Month Total**: Shows total expenses for the current calendar month with expense count

**2. Currency Formatting - 2 Decimal Places**
Updated all currency display across the app to show 2 decimal places (e.g., ₪20.45 instead of ₪20).

### Files Modified:
- `app/(dashboard)/expenses/page.tsx`:
  - Added summary cards above filters
  - Calculates year total based on selected year filter
  - Calculates current month total from displayed transactions

- `app/(dashboard)/analytics/page.tsx`:
  - Changed `maximumFractionDigits: 0` to `minimumFractionDigits: 2, maximumFractionDigits: 2`

- `app/(dashboard)/dashboard/page.tsx`:
  - Changed `maximumFractionDigits: 0` to `minimumFractionDigits: 2, maximumFractionDigits: 2`

- `app/(dashboard)/clients/page.tsx`:
  - Changed `maximumFractionDigits: 0` to `minimumFractionDigits: 2, maximumFractionDigits: 2`

- `app/(dashboard)/partners/page.tsx`:
  - Changed `maximumFractionDigits: 0` to `minimumFractionDigits: 2, maximumFractionDigits: 2`

- `app/(dashboard)/invoices/page.tsx`:
  - Changed `maximumFractionDigits: 0` to `minimumFractionDigits: 2, maximumFractionDigits: 2`

### Verification:
- TypeScript check: ✅ Passed
- Build: ✅ Passed

### UI Preview:
```
┌─────────────────────┐  ┌─────────────────────┐
│ 2026 Total          │  │ February 2026       │
│ ₪45,230.50          │  │ ₪8,150.75           │
│ 23 expenses         │  │ 5 expenses          │
└─────────────────────┘  └─────────────────────┘
```

---

## 2026-02-02 - Sunny AI Chatbot

### Changes:
Added Sunny AI chatbot - an embedded AI assistant powered by Google Gemini that acts as your CFO consultant.

### Features:
- **Floating chat widget** in bottom-right corner on all dashboard pages
- **Google Gemini 1.5 Flash** for responses (free tier: 1M tokens/month)
- **Auto-detects language** (Hebrew or English)
- **Full CFO knowledge**: Israeli tax law 2026, expense categories, partner calculations
- **Product knowledge**: How to use Sunny ERP features
- **Login required**: Only authenticated users can chat

### Files Created:
- `lib/chat/sunny-system-prompt.ts` - Comprehensive system prompt with all business logic
- `app/api/chat/route.ts` - Gemini API endpoint with authentication
- `components/chat/ChatWidget.tsx` - Floating chat UI component

### Files Modified:
- `app/(dashboard)/layout.tsx` - Added ChatWidget to layout
- `.env.example` - Added GOOGLE_GEMINI_API_KEY

### Dependencies Added:
- `@google/generative-ai` - Google Gemini SDK
- `ai` - Vercel AI SDK
- `react-markdown` - Markdown rendering in chat

### Setup Required:
1. Get API key from https://aistudio.google.com/
2. Add to `.env.local`: `GOOGLE_GEMINI_API_KEY=your-key`
3. Deploy

### System Prompt Includes:
- Business context (Automation Flow, partners, structure)
- Israeli tax categories with percentages (2026)
- Partner Current Account logic (Jeru)
- Sunny ERP product documentation
- How-to guides for common tasks
- Example interactions

### Verification:
- TypeScript check: ✅ Passed
- Build: ✅ Passed

### UI Design:
```
Floating button:     Chat panel (expanded):
┌────────────┐       ┌───────────────────────────┐
│ ☀️ Ask     │  -->  │ ☀️ Sunny                 X│
│   Sunny    │       │ Your AI CFO               │
└────────────┘       ├───────────────────────────┤
                     │ 👤 User message           │
                     │ ☀️ Sunny response...      │
                     ├───────────────────────────┤
                     │ [Ask Sunny anything...]  ➤│
                     └───────────────────────────┘
```

---

## 2026-02-02 - Tax-Only Transactions & Partner Settlement UI

### Overview:
Implemented filtering for "tax-only" transactions and improved the Partner page settlement display.

### What are Tax-Only Transactions?
When a partner pays from their **private card** for their **own benefit** (e.g., Heli pays for her phone bill from her private card):
- This is recorded for **tax purposes only** (future Green Invoice automation)
- It should NOT appear in business calculations because:
  - No business money was spent
  - No business benefit was received
  - Partner paid for themselves → net business impact = 0

### Transaction Classification:

| Payment Account | Beneficiary | Type | Visible? | Effect |
|----------------|-------------|------|----------|--------|
| Partner (private) | Business | **Out-of-Pocket** | ✅ Yes | Business owes partner |
| Business | Partner | **Benefits Received** | ✅ Yes | Partner owes business |
| Partner (private) | **Same** Partner | **Tax-Only** | **✅ Table Only** | Visible in expenses, excluded from calcs |
| Business | Business | **Normal Expense** | ✅ Yes | Standard business expense |

### CORRECTION (2026-02-02):
Tax-only expenses should be **visible in the Expenses table** but excluded from calculations. Updated `app/api/expenses/route.ts` to return all expenses with `is_tax_only` flag instead of filtering.

### Files Modified:
- `app/api/dashboard/route.ts` - Exclude tax-only from all calculations
- `app/api/analytics/route.ts` - Exclude tax-only from charts/aggregations
- `app/api/expenses/route.ts` - Returns ALL expenses with `is_tax_only` flag
- `app/(dashboard)/partners/page.tsx` - Action-oriented settlement text
- `app/(dashboard)/expenses/page.tsx` - Smart search, responsive layout, double-submit prevention

### Partner Page Settlement UI:
Changed from confusing "vs Shahar: +9,861.40₪" to action-oriented text:
- "To balance: Shahar pays you ₪4,930.70" (if owed money)
- "To balance: You pay Shahar ₪4,930.70" (if you owe)
- "✓ Balanced with Shahar" (if equal)

### Settlement Process:
Settlements happen naturally through withdrawals - no special feature needed.
When the UI shows "To balance: Shahar pays you ₪X":
- Heli can withdraw ₪X more in her next withdrawal
- OR Shahar can withdraw ₪X less
- The "Net Available" amounts will adjust accordingly

### Expenses Page UI (2026-02-02):
**Layout:** `[Search (flex-1)] ←→ [Year Filter] [+ Add Expense]`
**Smart Search:** `account=Heli & beneficiary=Business` or simple text
**Double-Submit Prevention:** Button disables during submission

### Verification:
- TypeScript check: ✅ Passed
- Build: ✅ Passed
