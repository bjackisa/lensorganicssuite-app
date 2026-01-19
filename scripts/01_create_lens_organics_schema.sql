-- Lens Organics Suite - Complete Database Schema
-- This script creates all tables and RLS policies for the agricultural management system

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES AND PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description, permissions) VALUES
  ('super_admin', 'Full system access', '{"all": true}'),
  ('managing_director', 'Farm operations and financial oversight', '{"farm_management": true, "financial": true, "employee": true, "equipment": true, "reports": true}'),
  ('field_manager', 'Farm and crop tracking', '{"farm_data": true, "crop_tracking": true, "equipment_view": true}'),
  ('processing_manager', 'Processing plant operations', '{"processing": true, "plant_management": true}'),
  ('accountant', 'Financial and accounting operations', '{"financial": true, "invoicing": true, "receipting": true, "reports": true}')
ON CONFLICT (name) DO NOTHING;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role_id UUID REFERENCES roles(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. FARMS TABLE
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  location TEXT,
  code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  total_acreage DECIMAL(10, 2),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default farms
INSERT INTO farms (name, location, code, status) VALUES
  ('Nakaseke Main Farm', 'Nakaseke, Uganda', 'NAKASEKE_MAIN', 'active'),
  ('Nakaseke Farm 2', 'Nakaseke, Uganda', 'NAKASEKE_2', 'active'),
  ('Bukeelere Farm', 'Bukeelere, Uganda', 'BUKEELERE', 'active')
ON CONFLICT (code) DO NOTHING;

-- 4. FARM ASSIGNMENTS (Field Managers/Workers can work on multiple farms)
CREATE TABLE IF NOT EXISTS farm_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, farm_id)
);

-- 5. CROPS/LIVESTOCK TYPES
CREATE TABLE IF NOT EXISTS crop_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('crop', 'livestock', 'fish')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default crops/livestock
INSERT INTO crop_types (name, type, description) VALUES
  ('Lemon Grass', 'crop', 'Aromatic grass for oil and floral water production'),
  ('Hass Avocado', 'crop', 'Premium avocado variety for local and export market'),
  ('Plantain (Gonja)', 'crop', 'Ugandan plantain variety for food production'),
  ('Coffee', 'crop', 'Coffee beans for local and international markets'),
  ('Chicken (Layers)', 'livestock', 'Egg-laying chickens for egg production'),
  ('Catfish', 'fish', 'Catfish rearing in ponds for aquaculture')
ON CONFLICT DO NOTHING;

-- 6. PRODUCTION ITEMS (Links crops to farms with lifecycle stages)
CREATE TABLE IF NOT EXISTS production_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  crop_type_id UUID NOT NULL REFERENCES crop_types(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  farm_stage_active BOOLEAN DEFAULT TRUE,
  processing_stage_active BOOLEAN DEFAULT FALSE,
  sale_stage_active BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(farm_id, crop_type_id)
);

-- 7. FARM STAGE RECORDS
CREATE TABLE IF NOT EXISTS farm_stage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  recorded_by UUID NOT NULL REFERENCES users(id),
  record_date DATE NOT NULL,
  quantity DECIMAL(15, 2),
  unit TEXT,
  description TEXT,
  weather_conditions TEXT,
  pest_observations TEXT,
  actions_taken TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. PROCESSING PLANTS
CREATE TABLE IF NOT EXISTS processing_plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  plant_type TEXT NOT NULL,
  capacity DECIMAL(15, 2),
  capacity_unit TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 9. PROCESSING STAGE RECORDS
CREATE TABLE IF NOT EXISTS processing_stage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  processing_plant_id UUID REFERENCES processing_plants(id),
  recorded_by UUID NOT NULL REFERENCES users(id),
  record_date DATE NOT NULL,
  input_quantity DECIMAL(15, 2),
  input_unit TEXT,
  output_quantity DECIMAL(15, 2),
  output_unit TEXT,
  output_product_name TEXT,
  processing_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 10. SALE STAGE RECORDS
CREATE TABLE IF NOT EXISTS sale_stage_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  sale_date DATE NOT NULL,
  quantity_sold DECIMAL(15, 2),
  unit TEXT,
  unit_price DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  total_amount DECIMAL(15, 2),
  buyer_name TEXT,
  buyer_contact TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 11. EQUIPMENT
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  serial_number TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(15, 2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 12. EQUIPMENT MAINTENANCE
CREATE TABLE IF NOT EXISTS equipment_maintenance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipment_id UUID NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  maintenance_date DATE NOT NULL,
  maintenance_type TEXT NOT NULL,
  description TEXT,
  cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  performed_by TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 13. EMPLOYEES
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  position TEXT NOT NULL,
  employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'suspended')),
  hire_date DATE,
  base_salary DECIMAL(15, 2),
  salary_currency TEXT DEFAULT 'UGX',
  department TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 14. EMPLOYEE ATTENDANCE
CREATE TABLE IF NOT EXISTS employee_attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'half_day')),
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, attendance_date)
);

-- 15. PAYROLL
CREATE TABLE IF NOT EXISTS payroll (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  base_salary DECIMAL(15, 2),
  deductions DECIMAL(15, 2) DEFAULT 0,
  bonuses DECIMAL(15, 2) DEFAULT 0,
  net_salary DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  payment_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, pay_period_start, pay_period_end)
);

-- 16. INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  farm_id UUID NOT NULL REFERENCES farms(id),
  created_by UUID NOT NULL REFERENCES users(id),
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  issue_date DATE NOT NULL,
  due_date DATE,
  currency TEXT DEFAULT 'UGX',
  subtotal DECIMAL(15, 2),
  tax DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 17. INVOICE ITEMS
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity DECIMAL(15, 2),
  unit_price DECIMAL(15, 2),
  total DECIMAL(15, 2),
  description TEXT
);

-- 18. RECEIPTS
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  receipt_number TEXT UNIQUE NOT NULL,
  farm_id UUID NOT NULL REFERENCES farms(id),
  received_by UUID NOT NULL REFERENCES users(id),
  payer_name TEXT NOT NULL,
  payer_contact TEXT,
  receipt_date DATE NOT NULL,
  currency TEXT DEFAULT 'UGX',
  amount DECIMAL(15, 2),
  payment_method TEXT CHECK (payment_method IN ('cash', 'mobile_money', 'bank_transfer', 'cheque')),
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 19. FINANCIAL TRANSACTIONS
CREATE TABLE IF NOT EXISTS financial_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('income', 'expense')),
  category TEXT NOT NULL,
  amount DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  transaction_date DATE NOT NULL,
  description TEXT,
  receipt_id UUID REFERENCES receipts(id),
  invoice_id UUID REFERENCES invoices(id),
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_farm_assignments_user ON farm_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_assignments_farm ON farm_assignments(farm_id);
CREATE INDEX IF NOT EXISTS idx_production_items_farm ON production_items(farm_id);
CREATE INDEX IF NOT EXISTS idx_production_items_crop ON production_items(crop_type_id);
CREATE INDEX IF NOT EXISTS idx_farm_stage_records_item ON farm_stage_records(production_item_id);
CREATE INDEX IF NOT EXISTS idx_farm_stage_records_date ON farm_stage_records(record_date);
CREATE INDEX IF NOT EXISTS idx_processing_plants_farm ON processing_plants(farm_id);
CREATE INDEX IF NOT EXISTS idx_processing_records_item ON processing_stage_records(production_item_id);
CREATE INDEX IF NOT EXISTS idx_sale_records_item ON sale_stage_records(production_item_id);
CREATE INDEX IF NOT EXISTS idx_equipment_farm ON equipment(farm_id);
CREATE INDEX IF NOT EXISTS idx_equipment_maintenance_eq ON equipment_maintenance(equipment_id);
CREATE INDEX IF NOT EXISTS idx_employees_farm ON employees(farm_id);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON employee_attendance(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON employee_attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll(employee_id);
CREATE INDEX IF NOT EXISTS idx_invoices_farm ON invoices(farm_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_receipts_farm ON receipts(farm_id);
CREATE INDEX IF NOT EXISTS idx_receipts_date ON receipts(receipt_date);
CREATE INDEX IF NOT EXISTS idx_transactions_farm ON financial_transactions(farm_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON financial_transactions(transaction_type);

-- Enable RLS (Row Level Security) for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_stage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
-- Users can see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR (SELECT role_id FROM users WHERE id = auth.uid()::uuid) IN (SELECT id FROM roles WHERE name = 'super_admin'));

-- Field managers can see farms they're assigned to
CREATE POLICY "Users can view assigned farms" ON farms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM farm_assignments 
      WHERE farm_assignments.farm_id = farms.id 
      AND farm_assignments.user_id = auth.uid()::uuid
    )
    OR (SELECT role_id FROM users WHERE id = auth.uid()::uuid) IN (SELECT id FROM roles WHERE name = 'super_admin')
  );

COMMIT;
