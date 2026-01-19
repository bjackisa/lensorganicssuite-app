-- =====================================================
-- Lens Organics Suite - Processing, Financial & Employee Schema
-- Migration 03: Processing plants, financial, and employee management
-- Run this AFTER 02_lens_organics_comprehensive_schema.sql
-- =====================================================

-- =====================================================
-- SECTION 1: ENHANCED PROCESSING PLANTS MANAGEMENT
-- =====================================================

-- Add more fields to processing_plants
ALTER TABLE processing_plants ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE processing_plants ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id);
ALTER TABLE processing_plants ADD COLUMN IF NOT EXISTS operating_hours TEXT;
ALTER TABLE processing_plants ADD COLUMN IF NOT EXISTS power_requirements TEXT;
ALTER TABLE processing_plants ADD COLUMN IF NOT EXISTS water_requirements TEXT;
ALTER TABLE processing_plants ADD COLUMN IF NOT EXISTS certifications JSONB;
ALTER TABLE processing_plants ADD COLUMN IF NOT EXISTS last_maintenance_date DATE;
ALTER TABLE processing_plants ADD COLUMN IF NOT EXISTS next_maintenance_date DATE;

-- Processing plant equipment
CREATE TABLE IF NOT EXISTS processing_equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES processing_plants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  model TEXT,
  serial_number TEXT,
  manufacturer TEXT,
  capacity DECIMAL(15, 2),
  capacity_unit TEXT,
  power_rating TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  warranty_expiry DATE,
  status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'maintenance', 'repair', 'decommissioned')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Processing runs (enhanced)
CREATE TABLE IF NOT EXISTS processing_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES processing_plants(id) ON DELETE CASCADE,
  production_item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  batch_code TEXT NOT NULL UNIQUE,
  run_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  input_source TEXT CHECK (input_source IN ('harvest', 'storage', 'purchase', 'transfer')),
  input_batch_reference TEXT,
  input_quantity DECIMAL(15, 2) NOT NULL,
  input_unit TEXT NOT NULL,
  input_quality_grade TEXT,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
  supervisor_id UUID REFERENCES users(id),
  workers_count INTEGER,
  labor_hours DECIMAL(10, 2),
  energy_consumed DECIMAL(15, 2),
  energy_unit TEXT,
  water_consumed DECIMAL(15, 2),
  water_unit TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Processing outputs (multiple outputs per run)
CREATE TABLE IF NOT EXISTS processing_outputs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES processing_runs(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  quality_grade TEXT CHECK (quality_grade IN ('premium', 'A', 'B', 'C', 'reject')),
  batch_number TEXT,
  production_date DATE,
  expiry_date DATE,
  storage_location TEXT,
  storage_conditions TEXT,
  packaging_type TEXT,
  packages_count INTEGER,
  unit_weight DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lemongrass specific: Oil extraction records
CREATE TABLE IF NOT EXISTS oil_extraction_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  run_id UUID NOT NULL REFERENCES processing_runs(id) ON DELETE CASCADE,
  distillation_method TEXT CHECK (distillation_method IN ('steam', 'hydro', 'steam_hydro')),
  distillation_duration_hours DECIMAL(6, 2),
  temperature_celsius DECIMAL(5, 2),
  pressure_bar DECIMAL(6, 2),
  oil_yield_ml DECIMAL(15, 2),
  oil_yield_percentage DECIMAL(5, 2),
  floral_water_yield_liters DECIMAL(15, 2),
  oil_density DECIMAL(6, 4),
  oil_color TEXT,
  oil_clarity TEXT,
  citral_content_percentage DECIMAL(5, 2),
  quality_test_results JSONB,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory/Stock management
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  plant_id UUID REFERENCES processing_plants(id) ON DELETE SET NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('raw_material', 'processed_product', 'byproduct', 'packaging', 'input', 'equipment_part', 'other')),
  item_name TEXT NOT NULL,
  sku TEXT,
  batch_number TEXT,
  quantity DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost DECIMAL(15, 2),
  total_value DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  storage_location TEXT,
  storage_conditions TEXT,
  production_date DATE,
  expiry_date DATE,
  reorder_level DECIMAL(15, 2),
  reorder_quantity DECIMAL(15, 2),
  supplier TEXT,
  status TEXT DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock', 'expired', 'reserved', 'damaged')),
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Inventory transactions
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inventory_id UUID NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'transfer', 'return', 'write_off', 'sale')),
  quantity DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  reference_type TEXT,
  reference_id UUID,
  from_location TEXT,
  to_location TEXT,
  unit_cost DECIMAL(15, 2),
  total_value DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  reason TEXT,
  notes TEXT,
  performed_by UUID NOT NULL REFERENCES users(id),
  transaction_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECTION 2: COMPREHENSIVE EMPLOYEE MANAGEMENT
-- =====================================================

-- Enhanced employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS employee_code TEXT UNIQUE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS national_id TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS marital_status TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS mobile_money_number TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'mobile_money' CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_money', 'cheque'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS contract_type TEXT CHECK (contract_type IN ('permanent', 'contract', 'casual', 'seasonal', 'intern'));
ALTER TABLE employees ADD COLUMN IF NOT EXISTS contract_start_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS contract_end_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS probation_end_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS termination_date DATE;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS termination_reason TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Employee departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  manager_id UUID REFERENCES employees(id),
  parent_department_id UUID REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default departments
INSERT INTO departments (name, description) VALUES
  ('Farm Operations', 'Field work, planting, harvesting, and crop management'),
  ('Livestock', 'Poultry, cattle, and other livestock management'),
  ('Aquaculture', 'Fish pond management and aquaculture operations'),
  ('Processing', 'Processing plant operations and product manufacturing'),
  ('Finance & Accounting', 'Financial management, invoicing, and accounting'),
  ('Human Resources', 'Employee management and administration'),
  ('Sales & Marketing', 'Product sales and customer relations'),
  ('Maintenance', 'Equipment and infrastructure maintenance'),
  ('Security', 'Farm security and asset protection'),
  ('Administration', 'General administration and management')
ON CONFLICT (name) DO NOTHING;

-- Employee department assignments
CREATE TABLE IF NOT EXISTS employee_departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT TRUE,
  assigned_date DATE DEFAULT CURRENT_DATE,
  UNIQUE(employee_id, department_id)
);

-- Employee skills/qualifications
CREATE TABLE IF NOT EXISTS employee_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  certification TEXT,
  certification_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Employee documents
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('contract', 'id_copy', 'certificate', 'medical', 'reference', 'disciplinary', 'performance_review', 'other')),
  document_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  issue_date DATE,
  expiry_date DATE,
  notes TEXT,
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leave types
CREATE TABLE IF NOT EXISTS leave_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  days_per_year INTEGER,
  is_paid BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default leave types
INSERT INTO leave_types (name, description, days_per_year, is_paid) VALUES
  ('Annual Leave', 'Regular annual vacation leave', 21, TRUE),
  ('Sick Leave', 'Medical leave for illness', 14, TRUE),
  ('Maternity Leave', 'Leave for childbirth and care', 60, TRUE),
  ('Paternity Leave', 'Leave for fathers after childbirth', 4, TRUE),
  ('Compassionate Leave', 'Leave for family emergencies', 5, TRUE),
  ('Unpaid Leave', 'Leave without pay', NULL, FALSE),
  ('Study Leave', 'Leave for educational purposes', 10, TRUE)
ON CONFLICT (name) DO NOTHING;

-- Leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INTEGER NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID REFERENCES users(id),
  approval_date TIMESTAMP,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Leave balances
CREATE TABLE IF NOT EXISTS leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES leave_types(id),
  year INTEGER NOT NULL,
  entitled_days INTEGER NOT NULL,
  used_days INTEGER DEFAULT 0,
  carried_over INTEGER DEFAULT 0,
  remaining_days INTEGER GENERATED ALWAYS AS (entitled_days + carried_over - used_days) STORED,
  UNIQUE(employee_id, leave_type_id, year)
);

-- Enhanced payroll
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS overtime_rate DECIMAL(15, 2);
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS overtime_amount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS allowances JSONB DEFAULT '{}';
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS total_allowances DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS deductions_breakdown JSONB DEFAULT '{}';
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS nssf_contribution DECIMAL(15, 2) DEFAULT 0;
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS gross_salary DECIMAL(15, 2);
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS paid_by UUID REFERENCES users(id);
ALTER TABLE payroll ADD COLUMN IF NOT EXISTS notes TEXT;

-- Salary advances
CREATE TABLE IF NOT EXISTS salary_advances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'UGX',
  request_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid', 'repaid')),
  approved_by UUID REFERENCES users(id),
  approval_date TIMESTAMP,
  payment_date DATE,
  repayment_start_date DATE,
  repayment_months INTEGER DEFAULT 1,
  monthly_deduction DECIMAL(15, 2),
  amount_repaid DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Work schedules/shifts
CREATE TABLE IF NOT EXISTS work_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_duration_minutes INTEGER DEFAULT 60,
  working_days JSONB DEFAULT '["monday", "tuesday", "wednesday", "thursday", "friday"]',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default schedules
INSERT INTO work_schedules (name, description, start_time, end_time, break_duration_minutes, is_default) VALUES
  ('Standard Day Shift', 'Regular 8am to 5pm shift', '08:00', '17:00', 60, TRUE),
  ('Early Morning Shift', 'Early shift for farm workers', '06:00', '14:00', 30, FALSE),
  ('Processing Shift', 'Processing plant shift', '07:00', '16:00', 60, FALSE)
ON CONFLICT DO NOTHING;

-- Employee schedule assignments
CREATE TABLE IF NOT EXISTS employee_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  schedule_id UUID NOT NULL REFERENCES work_schedules(id) ON DELETE CASCADE,
  effective_from DATE NOT NULL,
  effective_to DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced attendance
ALTER TABLE employee_attendance ADD COLUMN IF NOT EXISTS check_in_time TIME;
ALTER TABLE employee_attendance ADD COLUMN IF NOT EXISTS check_out_time TIME;
ALTER TABLE employee_attendance ADD COLUMN IF NOT EXISTS hours_worked DECIMAL(5, 2);
ALTER TABLE employee_attendance ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE employee_attendance ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE employee_attendance ADD COLUMN IF NOT EXISTS gps_coordinates TEXT;
ALTER TABLE employee_attendance ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('manual', 'biometric', 'mobile', 'card'));

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_processing_runs_plant ON processing_runs(plant_id);
CREATE INDEX IF NOT EXISTS idx_processing_runs_date ON processing_runs(run_date);
CREATE INDEX IF NOT EXISTS idx_processing_outputs_run ON processing_outputs(run_id);
CREATE INDEX IF NOT EXISTS idx_inventory_farm ON inventory(farm_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item ON inventory(item_name);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_inv ON inventory_transactions(inventory_id);
CREATE INDEX IF NOT EXISTS idx_employee_departments_emp ON employee_departments(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_emp ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_balances_emp ON leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_advances_emp ON salary_advances(employee_id);

COMMIT;
