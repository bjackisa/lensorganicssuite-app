-- =====================================================
-- Lens Organics Suite - Customers, Reports & RLS Policies
-- Migration 05: Customer management, reporting, and security
-- Run this AFTER 04_lens_organics_financial_equipment_sync.sql
-- =====================================================

-- =====================================================
-- SECTION 1: CUSTOMER/CLIENT MANAGEMENT
-- =====================================================

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_code TEXT UNIQUE,
  customer_type TEXT DEFAULT 'individual' CHECK (customer_type IN ('individual', 'business', 'government', 'ngo')),
  company_name TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  alternate_phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Uganda',
  tin_number TEXT,
  payment_terms INTEGER DEFAULT 30,
  credit_limit DECIMAL(18, 2),
  currency TEXT DEFAULT 'UGX',
  preferred_payment_method TEXT CHECK (preferred_payment_method IN ('cash', 'mobile_money', 'bank_transfer', 'cheque')),
  bank_name TEXT,
  bank_account TEXT,
  mobile_money_number TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  tags JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer contacts (multiple contacts per customer)
CREATE TABLE IF NOT EXISTS customer_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  email TEXT,
  phone TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Customer price lists (special pricing)
CREATE TABLE IF NOT EXISTS customer_price_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  production_item_id UUID REFERENCES production_items(id),
  product_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  standard_price DECIMAL(15, 2) NOT NULL,
  customer_price DECIMAL(15, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2),
  effective_from DATE,
  effective_to DATE,
  min_quantity DECIMAL(15, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer orders (pre-orders)
CREATE TABLE IF NOT EXISTS customer_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  farm_id UUID REFERENCES farms(id),
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  currency TEXT DEFAULT 'UGX',
  subtotal DECIMAL(18, 2),
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  discount_amount DECIMAL(15, 2) DEFAULT 0,
  shipping_cost DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(18, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'ready', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  delivery_address TEXT,
  delivery_notes TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer order items
CREATE TABLE IF NOT EXISTS customer_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES customer_orders(id) ON DELETE CASCADE,
  production_item_id UUID REFERENCES production_items(id),
  product_name TEXT NOT NULL,
  description TEXT,
  quantity DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  discount DECIMAL(15, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total DECIMAL(15, 2) NOT NULL,
  fulfilled_quantity DECIMAL(15, 2) DEFAULT 0,
  notes TEXT
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_code TEXT UNIQUE,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Uganda',
  tin_number TEXT,
  payment_terms INTEGER DEFAULT 30,
  bank_name TEXT,
  bank_account TEXT,
  mobile_money_number TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECTION 2: NOTIFICATIONS & ALERTS
-- =====================================================

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push', 'in_app')),
  subject TEXT,
  body TEXT NOT NULL,
  variables JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success', 'reminder')),
  category TEXT,
  reference_type TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled reminders
CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  reminder_date DATE NOT NULL,
  reminder_time TIME,
  recurrence TEXT CHECK (recurrence IN ('once', 'daily', 'weekly', 'monthly', 'yearly')),
  reference_type TEXT,
  reference_id UUID,
  is_active BOOLEAN DEFAULT TRUE,
  last_triggered TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECTION 3: REPORTING & ANALYTICS
-- =====================================================

-- Saved reports
CREATE TABLE IF NOT EXISTS saved_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('farm', 'financial', 'employee', 'equipment', 'processing', 'sales', 'inventory', 'custom')),
  parameters JSONB,
  filters JSONB,
  columns JSONB,
  chart_config JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Report schedules (automated reports)
CREATE TABLE IF NOT EXISTS report_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES saved_reports(id) ON DELETE CASCADE,
  schedule_type TEXT NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  day_of_week INTEGER,
  day_of_month INTEGER,
  time_of_day TIME DEFAULT '08:00',
  recipients JSONB,
  format TEXT DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv')),
  is_active BOOLEAN DEFAULT TRUE,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Dashboard widgets configuration
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL,
  title TEXT NOT NULL,
  config JSONB,
  position INTEGER,
  size TEXT DEFAULT 'medium' CHECK (size IN ('small', 'medium', 'large', 'full')),
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECTION 4: SYSTEM SETTINGS & CONFIGURATION
-- =====================================================

-- System settings
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  category TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
  ('company_name', 'Lens Organics', 'string', 'general', 'Company name', TRUE),
  ('company_address', 'Uganda', 'string', 'general', 'Company address', TRUE),
  ('company_phone', '', 'string', 'general', 'Company phone', TRUE),
  ('company_email', 'info@lensorganics.com', 'string', 'general', 'Company email', TRUE),
  ('company_website', 'https://lensorganics.com', 'string', 'general', 'Company website', TRUE),
  ('default_currency', 'UGX', 'string', 'financial', 'Default currency', TRUE),
  ('tax_rate', '18', 'number', 'financial', 'Default VAT rate', FALSE),
  ('invoice_prefix', 'INV', 'string', 'financial', 'Invoice number prefix', FALSE),
  ('receipt_prefix', 'RCP', 'string', 'financial', 'Receipt number prefix', FALSE),
  ('po_prefix', 'PO', 'string', 'financial', 'Purchase order prefix', FALSE),
  ('fiscal_year_start', '01-01', 'string', 'financial', 'Fiscal year start (MM-DD)', FALSE),
  ('date_format', 'DD/MM/YYYY', 'string', 'general', 'Date display format', TRUE),
  ('time_format', '24h', 'string', 'general', 'Time display format', TRUE),
  ('timezone', 'Africa/Kampala', 'string', 'general', 'System timezone', TRUE),
  ('low_stock_threshold', '10', 'number', 'inventory', 'Low stock alert threshold', FALSE),
  ('password_min_length', '8', 'number', 'security', 'Minimum password length', FALSE),
  ('session_timeout_minutes', '60', 'number', 'security', 'Session timeout in minutes', FALSE),
  ('enable_2fa', 'false', 'boolean', 'security', 'Enable two-factor authentication', FALSE),
  ('offline_sync_enabled', 'true', 'boolean', 'sync', 'Enable offline sync', TRUE),
  ('auto_sync_interval_minutes', '5', 'number', 'sync', 'Auto sync interval', FALSE)
ON CONFLICT (setting_key) DO NOTHING;

-- Number sequences (for auto-generating numbers)
CREATE TABLE IF NOT EXISTS number_sequences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sequence_name TEXT NOT NULL UNIQUE,
  prefix TEXT,
  suffix TEXT,
  current_value INTEGER DEFAULT 0,
  padding_length INTEGER DEFAULT 6,
  reset_frequency TEXT CHECK (reset_frequency IN ('never', 'yearly', 'monthly')),
  last_reset DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default sequences
INSERT INTO number_sequences (sequence_name, prefix, current_value, padding_length) VALUES
  ('invoice', 'INV-', 0, 6),
  ('receipt', 'RCP-', 0, 6),
  ('purchase_order', 'PO-', 0, 6),
  ('expense', 'EXP-', 0, 6),
  ('customer', 'CUS-', 0, 5),
  ('supplier', 'SUP-', 0, 5),
  ('employee', 'EMP-', 0, 5),
  ('equipment', 'EQP-', 0, 5),
  ('batch', 'BAT-', 0, 6),
  ('order', 'ORD-', 0, 6)
ON CONFLICT (sequence_name) DO NOTHING;

-- =====================================================
-- SECTION 5: ENHANCED RLS POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is super admin
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = user_uuid AND r.name = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is managing director
CREATE OR REPLACE FUNCTION is_managing_director(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = user_uuid AND r.name = 'managing_director'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get user's assigned farms
CREATE OR REPLACE FUNCTION get_user_farms(user_uuid UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
  SELECT farm_id FROM farm_assignments WHERE user_id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Customers policies
CREATE POLICY "Super admin and MD can manage customers" ON customers
  FOR ALL USING (
    is_super_admin(auth.uid()::uuid) OR is_managing_director(auth.uid()::uuid)
  );

CREATE POLICY "Field managers can view customers" ON customers
  FOR SELECT USING (TRUE);

-- Expenses policies
CREATE POLICY "Users can view expenses for their farms" ON expenses
  FOR SELECT USING (
    is_super_admin(auth.uid()::uuid) 
    OR is_managing_director(auth.uid()::uuid)
    OR farm_id IN (SELECT get_user_farms(auth.uid()::uuid))
  );

CREATE POLICY "Users can create expenses for their farms" ON expenses
  FOR INSERT WITH CHECK (
    is_super_admin(auth.uid()::uuid) 
    OR is_managing_director(auth.uid()::uuid)
    OR farm_id IN (SELECT get_user_farms(auth.uid()::uuid))
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid()::uuid);

-- Activity logs policies
CREATE POLICY "Super admin can view all activity logs" ON activity_logs
  FOR SELECT USING (is_super_admin(auth.uid()::uuid));

CREATE POLICY "MD can view activity logs" ON activity_logs
  FOR SELECT USING (is_managing_director(auth.uid()::uuid));

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_customers_code ON customers(customer_code);
CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(is_active);
CREATE INDEX IF NOT EXISTS idx_customer_orders_customer ON customer_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_orders_status ON customer_orders(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_code ON suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

COMMIT;
