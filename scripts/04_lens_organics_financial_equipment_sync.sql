-- =====================================================
-- Lens Organics Suite - Financial, Equipment & Sync Schema
-- Migration 04: Financial management, equipment, and offline sync
-- Run this AFTER 03_lens_organics_processing_financial_employees.sql
-- =====================================================

-- =====================================================
-- SECTION 1: COMPREHENSIVE FINANCIAL MANAGEMENT
-- =====================================================

-- Chart of accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_code TEXT NOT NULL UNIQUE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  parent_account_id UUID REFERENCES chart_of_accounts(id),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_system BOOLEAN DEFAULT FALSE,
  balance DECIMAL(18, 2) DEFAULT 0,
  currency TEXT DEFAULT 'UGX',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default chart of accounts
INSERT INTO chart_of_accounts (account_code, account_name, account_type, description, is_system) VALUES
  -- Assets
  ('1000', 'Assets', 'asset', 'All assets', TRUE),
  ('1100', 'Cash and Bank', 'asset', 'Cash and bank accounts', TRUE),
  ('1110', 'Petty Cash', 'asset', 'Petty cash on hand', TRUE),
  ('1120', 'Bank Account - Main', 'asset', 'Primary bank account', TRUE),
  ('1130', 'Mobile Money', 'asset', 'Mobile money accounts', TRUE),
  ('1200', 'Accounts Receivable', 'asset', 'Money owed by customers', TRUE),
  ('1300', 'Inventory', 'asset', 'Stock and inventory', TRUE),
  ('1400', 'Fixed Assets', 'asset', 'Property, equipment, etc.', TRUE),
  ('1410', 'Land', 'asset', 'Farm land', TRUE),
  ('1420', 'Buildings', 'asset', 'Farm buildings and structures', TRUE),
  ('1430', 'Equipment', 'asset', 'Farm and processing equipment', TRUE),
  ('1440', 'Vehicles', 'asset', 'Farm vehicles', TRUE),
  -- Liabilities
  ('2000', 'Liabilities', 'liability', 'All liabilities', TRUE),
  ('2100', 'Accounts Payable', 'liability', 'Money owed to suppliers', TRUE),
  ('2200', 'Salaries Payable', 'liability', 'Unpaid employee salaries', TRUE),
  ('2300', 'Taxes Payable', 'liability', 'Tax obligations', TRUE),
  ('2400', 'Loans Payable', 'liability', 'Bank and other loans', TRUE),
  -- Equity
  ('3000', 'Equity', 'equity', 'Owner equity', TRUE),
  ('3100', 'Owner Capital', 'equity', 'Owner investment', TRUE),
  ('3200', 'Retained Earnings', 'equity', 'Accumulated profits', TRUE),
  -- Revenue
  ('4000', 'Revenue', 'revenue', 'All income', TRUE),
  ('4100', 'Crop Sales', 'revenue', 'Income from crop sales', TRUE),
  ('4110', 'Lemongrass Oil Sales', 'revenue', 'Lemongrass oil revenue', TRUE),
  ('4120', 'Floral Water Sales', 'revenue', 'Floral water revenue', TRUE),
  ('4130', 'Avocado Sales', 'revenue', 'Avocado revenue', TRUE),
  ('4140', 'Coffee Sales', 'revenue', 'Coffee revenue', TRUE),
  ('4150', 'Plantain Sales', 'revenue', 'Plantain/Gonja revenue', TRUE),
  ('4200', 'Livestock Sales', 'revenue', 'Income from livestock', TRUE),
  ('4210', 'Egg Sales', 'revenue', 'Egg revenue', TRUE),
  ('4220', 'Chicken Sales', 'revenue', 'Chicken/poultry revenue', TRUE),
  ('4230', 'Fish Sales', 'revenue', 'Catfish revenue', TRUE),
  ('4300', 'Other Income', 'revenue', 'Miscellaneous income', TRUE),
  -- Expenses
  ('5000', 'Expenses', 'expense', 'All expenses', TRUE),
  ('5100', 'Cost of Goods Sold', 'expense', 'Direct costs', TRUE),
  ('5200', 'Labor Costs', 'expense', 'Employee wages and benefits', TRUE),
  ('5210', 'Salaries', 'expense', 'Employee salaries', TRUE),
  ('5220', 'Wages - Casual', 'expense', 'Casual labor wages', TRUE),
  ('5230', 'NSSF Contributions', 'expense', 'Social security contributions', TRUE),
  ('5300', 'Farm Inputs', 'expense', 'Seeds, fertilizers, etc.', TRUE),
  ('5310', 'Seeds and Seedlings', 'expense', 'Planting materials', TRUE),
  ('5320', 'Fertilizers', 'expense', 'Fertilizer costs', TRUE),
  ('5330', 'Pesticides', 'expense', 'Pest control costs', TRUE),
  ('5340', 'Animal Feed', 'expense', 'Livestock and fish feed', TRUE),
  ('5350', 'Veterinary', 'expense', 'Animal health costs', TRUE),
  ('5400', 'Utilities', 'expense', 'Water, electricity, etc.', TRUE),
  ('5410', 'Electricity', 'expense', 'Power costs', TRUE),
  ('5420', 'Water', 'expense', 'Water costs', TRUE),
  ('5430', 'Fuel', 'expense', 'Fuel and oil', TRUE),
  ('5500', 'Maintenance', 'expense', 'Repairs and maintenance', TRUE),
  ('5510', 'Equipment Maintenance', 'expense', 'Equipment repairs', TRUE),
  ('5520', 'Building Maintenance', 'expense', 'Building repairs', TRUE),
  ('5530', 'Vehicle Maintenance', 'expense', 'Vehicle repairs', TRUE),
  ('5600', 'Transport', 'expense', 'Transportation costs', TRUE),
  ('5700', 'Administrative', 'expense', 'Office and admin costs', TRUE),
  ('5800', 'Marketing', 'expense', 'Sales and marketing costs', TRUE),
  ('5900', 'Depreciation', 'expense', 'Asset depreciation', TRUE)
ON CONFLICT (account_code) DO NOTHING;

-- Bank accounts
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('checking', 'savings', 'mobile_money', 'cash')),
  currency TEXT DEFAULT 'UGX',
  opening_balance DECIMAL(18, 2) DEFAULT 0,
  current_balance DECIMAL(18, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  chart_account_id UUID REFERENCES chart_of_accounts(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced invoices
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_type TEXT DEFAULT 'sale' CHECK (invoice_type IN ('sale', 'proforma', 'credit_note'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_address TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS customer_tin TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed'));
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_value DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms TEXT;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES bank_accounts(id);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS balance_due DECIMAL(15, 2);
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS last_reminder_date DATE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0;

-- Invoice line items (enhanced)
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS item_type TEXT CHECK (item_type IN ('product', 'service', 'other'));
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS tax_rate DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS production_item_id UUID REFERENCES production_items(id);

-- Purchase orders
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT NOT NULL UNIQUE,
  farm_id UUID NOT NULL REFERENCES farms(id),
  supplier_name TEXT NOT NULL,
  supplier_contact TEXT,
  supplier_email TEXT,
  supplier_address TEXT,
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  currency TEXT DEFAULT 'UGX',
  subtotal DECIMAL(18, 2),
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  shipping_cost DECIMAL(15, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(18, 2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  payment_terms TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase order items
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(15, 2) NOT NULL,
  unit TEXT,
  unit_price DECIMAL(15, 2) NOT NULL,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  received_quantity DECIMAL(15, 2) DEFAULT 0,
  category TEXT
);

-- Expenses (enhanced)
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  expense_number TEXT UNIQUE,
  expense_date DATE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  chart_account_id UUID REFERENCES chart_of_accounts(id),
  vendor_name TEXT,
  vendor_contact TEXT,
  description TEXT NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(18, 2) NOT NULL,
  currency TEXT DEFAULT 'UGX',
  payment_method TEXT CHECK (payment_method IN ('cash', 'mobile_money', 'bank_transfer', 'cheque', 'credit')),
  payment_status TEXT DEFAULT 'paid' CHECK (payment_status IN ('pending', 'paid', 'partial')),
  bank_account_id UUID REFERENCES bank_accounts(id),
  reference_number TEXT,
  receipt_url TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  next_occurrence DATE,
  approved_by UUID REFERENCES users(id),
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Expense categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_category_id UUID REFERENCES expense_categories(id),
  chart_account_id UUID REFERENCES chart_of_accounts(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default expense categories
INSERT INTO expense_categories (name, description) VALUES
  ('Farm Inputs', 'Seeds, fertilizers, pesticides, etc.'),
  ('Labor', 'Wages and casual labor'),
  ('Equipment', 'Equipment purchase and maintenance'),
  ('Utilities', 'Water, electricity, fuel'),
  ('Transport', 'Transportation and logistics'),
  ('Processing', 'Processing plant operations'),
  ('Livestock Feed', 'Animal and fish feed'),
  ('Veterinary', 'Animal health and medications'),
  ('Administrative', 'Office and admin expenses'),
  ('Marketing', 'Sales and marketing costs'),
  ('Repairs', 'Maintenance and repairs'),
  ('Other', 'Miscellaneous expenses')
ON CONFLICT (name) DO NOTHING;

-- Enhanced receipts
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS receipt_type TEXT DEFAULT 'payment' CHECK (receipt_type IN ('payment', 'deposit', 'refund'));
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS bank_account_id UUID REFERENCES bank_accounts(id);
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS reference_number TEXT;
ALTER TABLE receipts ADD COLUMN IF NOT EXISTS notes TEXT;

-- Payment records (for tracking all payments)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_number TEXT UNIQUE,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('customer_payment', 'supplier_payment', 'salary_payment', 'expense_payment', 'refund', 'other')),
  payment_date DATE NOT NULL,
  amount DECIMAL(18, 2) NOT NULL,
  currency TEXT DEFAULT 'UGX',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'mobile_money', 'bank_transfer', 'cheque')),
  bank_account_id UUID REFERENCES bank_accounts(id),
  reference_type TEXT,
  reference_id UUID,
  payer_payee_name TEXT,
  payer_payee_contact TEXT,
  reference_number TEXT,
  description TEXT,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'reversed')),
  recorded_by UUID NOT NULL REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Budget management
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id),
  name TEXT NOT NULL,
  description TEXT,
  fiscal_year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_budget DECIMAL(18, 2) NOT NULL,
  currency TEXT DEFAULT 'UGX',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'active', 'closed')),
  approved_by UUID REFERENCES users(id),
  approval_date TIMESTAMP,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Budget line items
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  chart_account_id UUID REFERENCES chart_of_accounts(id),
  category TEXT NOT NULL,
  description TEXT,
  budgeted_amount DECIMAL(18, 2) NOT NULL,
  actual_amount DECIMAL(18, 2) DEFAULT 0,
  variance DECIMAL(18, 2) GENERATED ALWAYS AS (budgeted_amount - actual_amount) STORED,
  notes TEXT
);

-- =====================================================
-- SECTION 2: ENHANCED EQUIPMENT MANAGEMENT
-- =====================================================

-- Enhanced equipment table
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS manufacturer TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS year_manufactured INTEGER;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS warranty_expiry DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS depreciation_method TEXT CHECK (depreciation_method IN ('straight_line', 'declining_balance', 'none'));
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS useful_life_years INTEGER;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS salvage_value DECIMAL(15, 2);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS current_value DECIMAL(15, 2);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS last_service_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS next_service_date DATE;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS service_interval_days INTEGER;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS fuel_type TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS fuel_capacity DECIMAL(10, 2);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS operating_hours DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS odometer_reading DECIMAL(15, 2);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES employees(id);
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS documents JSONB;

-- Equipment categories
CREATE TABLE IF NOT EXISTS equipment_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  depreciation_rate DECIMAL(5, 2),
  useful_life_years INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default equipment categories
INSERT INTO equipment_categories (name, description, depreciation_rate, useful_life_years) VALUES
  ('Tractors', 'Farm tractors and attachments', 10, 10),
  ('Irrigation', 'Irrigation systems and pumps', 15, 7),
  ('Processing', 'Processing plant equipment', 10, 10),
  ('Vehicles', 'Farm vehicles and trucks', 15, 7),
  ('Hand Tools', 'Manual farming tools', 25, 4),
  ('Power Tools', 'Electric and fuel-powered tools', 20, 5),
  ('Storage', 'Storage containers and silos', 10, 10),
  ('Livestock Equipment', 'Poultry and livestock equipment', 15, 7),
  ('Aquaculture Equipment', 'Fish pond equipment', 15, 7),
  ('Office Equipment', 'Computers and office equipment', 25, 4)
ON CONFLICT (name) DO NOTHING;

-- Enhanced equipment maintenance
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS maintenance_category TEXT CHECK (maintenance_category IN ('preventive', 'corrective', 'emergency', 'upgrade'));
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical'));
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'));
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS scheduled_date DATE;
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS completed_date DATE;
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS downtime_hours DECIMAL(10, 2);
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS parts_used JSONB;
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS labor_hours DECIMAL(10, 2);
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS labor_cost DECIMAL(15, 2);
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS parts_cost DECIMAL(15, 2);
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS vendor_name TEXT;
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS next_maintenance_date DATE;
ALTER TABLE equipment_maintenance ADD COLUMN IF NOT EXISTS photos JSONB;

-- Equipment usage logs
CREATE TABLE IF NOT EXISTS equipment_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  hours_used DECIMAL(10, 2),
  fuel_consumed DECIMAL(10, 2),
  fuel_unit TEXT,
  odometer_start DECIMAL(15, 2),
  odometer_end DECIMAL(15, 2),
  activity_type TEXT,
  activity_description TEXT,
  farm_id UUID REFERENCES farms(id),
  zone_id UUID REFERENCES farm_zones(id),
  operator_id UUID REFERENCES employees(id),
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Equipment fuel logs
CREATE TABLE IF NOT EXISTS equipment_fuel_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  fuel_date DATE NOT NULL,
  fuel_type TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(15, 2),
  total_cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  odometer_reading DECIMAL(15, 2),
  fuel_station TEXT,
  receipt_number TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECTION 3: OFFLINE SYNC SUPPORT
-- =====================================================

-- Sync queue for offline operations
CREATE TABLE IF NOT EXISTS sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  device_id TEXT,
  operation TEXT NOT NULL CHECK (operation IN ('create', 'update', 'delete')),
  table_name TEXT NOT NULL,
  record_id UUID,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'synced', 'failed', 'conflict')),
  conflict_data JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  synced_at TIMESTAMP
);

-- Sync status tracking
CREATE TABLE IF NOT EXISTS sync_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  device_id TEXT NOT NULL,
  last_sync_at TIMESTAMP,
  last_sync_status TEXT CHECK (last_sync_status IN ('success', 'partial', 'failed')),
  pending_count INTEGER DEFAULT 0,
  synced_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, device_id)
);

-- Data versions for conflict resolution
CREATE TABLE IF NOT EXISTS data_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  UNIQUE(table_name, record_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chart_accounts_type ON chart_of_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_active ON bank_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_farm ON purchase_orders(farm_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_expenses_farm ON expenses(farm_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_budgets_farm ON budgets(farm_id);
CREATE INDEX IF NOT EXISTS idx_budgets_year ON budgets(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_equipment_usage_eq ON equipment_usage_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_equipment_usage_date ON equipment_usage_logs(usage_date);
CREATE INDEX IF NOT EXISTS idx_equipment_fuel_eq ON equipment_fuel_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_user ON sync_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);

COMMIT;
