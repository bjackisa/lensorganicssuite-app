-- =====================================================
-- Lens Organics Suite - Comprehensive Schema Enhancement
-- Migration 02: Extended tables for full farm management
-- Run this AFTER 01_create_lens_organics_schema.sql
-- =====================================================

-- =====================================================
-- SECTION 1: ENHANCED USER & ROLE MANAGEMENT
-- =====================================================

-- Add more fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_phone TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- User sessions for tracking login history
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address TEXT,
  login_at TIMESTAMP DEFAULT NOW(),
  logout_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- Activity logs for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permission templates for granular access control
CREATE TABLE IF NOT EXISTS permission_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '{}',
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert comprehensive permission templates
INSERT INTO permission_templates (name, description, permissions, is_system) VALUES
  ('full_access', 'Complete system access', '{"users": ["create", "read", "update", "delete"], "farms": ["create", "read", "update", "delete"], "crops": ["create", "read", "update", "delete"], "employees": ["create", "read", "update", "delete"], "equipment": ["create", "read", "update", "delete"], "financial": ["create", "read", "update", "delete"], "processing": ["create", "read", "update", "delete"], "reports": ["create", "read", "export"], "settings": ["read", "update"]}', TRUE),
  ('farm_operations', 'Farm and crop management', '{"farms": ["read"], "crops": ["create", "read", "update"], "farm_activities": ["create", "read", "update"], "equipment": ["read"], "processing": ["read"]}', TRUE),
  ('financial_access', 'Financial management access', '{"financial": ["create", "read", "update", "delete"], "invoices": ["create", "read", "update", "delete"], "receipts": ["create", "read", "update", "delete"], "expenses": ["create", "read", "update", "delete"], "reports": ["read", "export"]}', TRUE),
  ('employee_management', 'Employee and payroll access', '{"employees": ["create", "read", "update", "delete"], "attendance": ["create", "read", "update"], "payroll": ["create", "read", "update", "delete"]}', TRUE),
  ('view_only', 'Read-only access to all modules', '{"farms": ["read"], "crops": ["read"], "employees": ["read"], "equipment": ["read"], "financial": ["read"], "processing": ["read"], "reports": ["read"]}', TRUE)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- SECTION 2: ENHANCED FARM MANAGEMENT
-- =====================================================

-- Add more fields to farms table
ALTER TABLE farms ADD COLUMN IF NOT EXISTS gps_coordinates TEXT;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS soil_type TEXT;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS water_source TEXT;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS electricity_available BOOLEAN DEFAULT FALSE;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES users(id);
ALTER TABLE farms ADD COLUMN IF NOT EXISTS contact_phone TEXT;
ALTER TABLE farms ADD COLUMN IF NOT EXISTS address TEXT;

-- Farm zones/sections for detailed tracking
CREATE TABLE IF NOT EXISTS farm_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  zone_type TEXT CHECK (zone_type IN ('cultivation', 'livestock', 'aquaculture', 'processing', 'storage', 'residential', 'other')),
  acreage DECIMAL(10, 2),
  gps_coordinates TEXT,
  soil_type TEXT,
  irrigation_type TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'fallow', 'under_preparation')),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(farm_id, code)
);

-- Farm infrastructure
CREATE TABLE IF NOT EXISTS farm_infrastructure (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  infrastructure_type TEXT NOT NULL CHECK (infrastructure_type IN ('building', 'storage', 'water_tank', 'irrigation', 'fence', 'road', 'electricity', 'pond', 'greenhouse', 'other')),
  capacity DECIMAL(15, 2),
  capacity_unit TEXT,
  construction_date DATE,
  construction_cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  condition TEXT CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'needs_repair')),
  last_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECTION 3: COMPREHENSIVE CROP/LIVESTOCK MANAGEMENT
-- =====================================================

-- Add more fields to crop_types
ALTER TABLE crop_types ADD COLUMN IF NOT EXISTS scientific_name TEXT;
ALTER TABLE crop_types ADD COLUMN IF NOT EXISTS growth_duration_days INTEGER;
ALTER TABLE crop_types ADD COLUMN IF NOT EXISTS optimal_temperature_min DECIMAL(5, 2);
ALTER TABLE crop_types ADD COLUMN IF NOT EXISTS optimal_temperature_max DECIMAL(5, 2);
ALTER TABLE crop_types ADD COLUMN IF NOT EXISTS water_requirements TEXT;
ALTER TABLE crop_types ADD COLUMN IF NOT EXISTS soil_requirements TEXT;
ALTER TABLE crop_types ADD COLUMN IF NOT EXISTS harvest_method TEXT;
ALTER TABLE crop_types ADD COLUMN IF NOT EXISTS storage_requirements TEXT;
ALTER TABLE crop_types ADD COLUMN IF NOT EXISTS icon_name TEXT;
ALTER TABLE crop_types ADD COLUMN IF NOT EXISTS color_code TEXT;

-- Crop varieties/breeds
CREATE TABLE IF NOT EXISTS crop_varieties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_type_id UUID NOT NULL REFERENCES crop_types(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  origin TEXT,
  yield_per_acre DECIMAL(10, 2),
  yield_unit TEXT,
  maturity_days INTEGER,
  disease_resistance TEXT,
  special_characteristics TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default varieties
INSERT INTO crop_varieties (crop_type_id, name, description, yield_per_acre, yield_unit, maturity_days) 
SELECT id, 'Standard Lemon Grass', 'Common variety for oil extraction', 2000, 'kg', 120 FROM crop_types WHERE name = 'Lemon Grass'
ON CONFLICT DO NOTHING;

INSERT INTO crop_varieties (crop_type_id, name, description, yield_per_acre, yield_unit, maturity_days) 
SELECT id, 'Hass', 'Premium export variety', 800, 'fruits', 365 FROM crop_types WHERE name = 'Hass Avocado'
ON CONFLICT DO NOTHING;

-- Planting batches (tracks each planting cycle)
CREATE TABLE IF NOT EXISTS planting_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
  variety_id UUID REFERENCES crop_varieties(id) ON DELETE SET NULL,
  batch_code TEXT NOT NULL UNIQUE,
  planting_date DATE NOT NULL,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  quantity_planted DECIMAL(15, 2),
  quantity_unit TEXT,
  area_planted DECIMAL(10, 2),
  area_unit TEXT DEFAULT 'acres',
  seed_source TEXT,
  seed_cost DECIMAL(15, 2),
  status TEXT DEFAULT 'growing' CHECK (status IN ('preparing', 'planted', 'growing', 'flowering', 'fruiting', 'ready_for_harvest', 'harvesting', 'harvested', 'failed')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Growth tracking records
CREATE TABLE IF NOT EXISTS growth_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES planting_batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  growth_stage TEXT,
  height_cm DECIMAL(10, 2),
  health_status TEXT CHECK (health_status IN ('excellent', 'good', 'fair', 'poor', 'diseased', 'pest_affected')),
  pest_observations TEXT,
  disease_observations TEXT,
  weather_conditions TEXT,
  temperature_high DECIMAL(5, 2),
  temperature_low DECIMAL(5, 2),
  rainfall_mm DECIMAL(10, 2),
  humidity_percent DECIMAL(5, 2),
  actions_taken TEXT,
  photos JSONB,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Farm activities/tasks
CREATE TABLE IF NOT EXISTS farm_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES planting_batches(id) ON DELETE SET NULL,
  production_item_id UUID REFERENCES production_items(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('planting', 'watering', 'fertilizing', 'weeding', 'pruning', 'pest_control', 'disease_treatment', 'harvesting', 'soil_preparation', 'irrigation_maintenance', 'general_maintenance', 'inspection', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  scheduled_date DATE,
  completed_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to UUID REFERENCES users(id),
  completed_by UUID REFERENCES users(id),
  labor_hours DECIMAL(10, 2),
  materials_used JSONB,
  cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  notes TEXT,
  photos JSONB,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Input applications (fertilizers, pesticides, etc.)
CREATE TABLE IF NOT EXISTS input_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_activity_id UUID REFERENCES farm_activities(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES planting_batches(id) ON DELETE SET NULL,
  zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('fertilizer', 'pesticide', 'herbicide', 'fungicide', 'seed', 'water', 'organic_matter', 'other')),
  product_name TEXT NOT NULL,
  brand TEXT,
  quantity DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  application_method TEXT,
  application_date DATE NOT NULL,
  weather_at_application TEXT,
  cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  batch_number TEXT,
  expiry_date DATE,
  applied_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Harvest records
CREATE TABLE IF NOT EXISTS harvest_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID REFERENCES planting_batches(id) ON DELETE SET NULL,
  production_item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
  harvest_date DATE NOT NULL,
  quantity DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  quality_grade TEXT CHECK (quality_grade IN ('A', 'B', 'C', 'reject')),
  quality_notes TEXT,
  storage_location TEXT,
  destination TEXT CHECK (destination IN ('processing', 'direct_sale', 'storage', 'internal_use', 'waste')),
  labor_hours DECIMAL(10, 2),
  workers_count INTEGER,
  weather_conditions TEXT,
  harvested_by UUID REFERENCES users(id),
  notes TEXT,
  photos JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECTION 4: LIVESTOCK SPECIFIC TABLES
-- =====================================================

-- Livestock batches/flocks
CREATE TABLE IF NOT EXISTS livestock_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  production_item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
  batch_code TEXT NOT NULL UNIQUE,
  breed TEXT,
  source TEXT,
  acquisition_date DATE NOT NULL,
  acquisition_type TEXT CHECK (acquisition_type IN ('purchase', 'hatched', 'born', 'transferred')),
  initial_count INTEGER NOT NULL,
  current_count INTEGER NOT NULL,
  age_at_acquisition_days INTEGER,
  unit_cost DECIMAL(15, 2),
  total_cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'culled', 'deceased', 'transferred')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Livestock health records
CREATE TABLE IF NOT EXISTS livestock_health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES livestock_batches(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'medication', 'health_check', 'disease_outbreak', 'mortality', 'treatment', 'deworming', 'other')),
  description TEXT NOT NULL,
  medication_name TEXT,
  dosage TEXT,
  administered_by TEXT,
  veterinarian_name TEXT,
  affected_count INTEGER,
  mortality_count INTEGER,
  cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  next_due_date DATE,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Egg production records (for layers)
CREATE TABLE IF NOT EXISTS egg_production_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES livestock_batches(id) ON DELETE CASCADE,
  production_date DATE NOT NULL,
  total_eggs INTEGER NOT NULL,
  grade_a_count INTEGER DEFAULT 0,
  grade_b_count INTEGER DEFAULT 0,
  broken_count INTEGER DEFAULT 0,
  collection_time TIME,
  bird_count INTEGER,
  production_rate DECIMAL(5, 2),
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(batch_id, production_date)
);

-- Feed records
CREATE TABLE IF NOT EXISTS feed_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  batch_id UUID NOT NULL REFERENCES livestock_batches(id) ON DELETE CASCADE,
  feed_date DATE NOT NULL,
  feed_type TEXT NOT NULL,
  brand TEXT,
  quantity DECIMAL(15, 2) NOT NULL,
  unit TEXT NOT NULL,
  cost_per_unit DECIMAL(15, 2),
  total_cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  feeding_time TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SECTION 5: AQUACULTURE (FISH PONDS) SPECIFIC TABLES
-- =====================================================

-- Fish ponds
CREATE TABLE IF NOT EXISTS fish_ponds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  pond_code TEXT NOT NULL UNIQUE,
  pond_type TEXT CHECK (pond_type IN ('earthen', 'concrete', 'liner', 'tank', 'cage')),
  length_m DECIMAL(10, 2),
  width_m DECIMAL(10, 2),
  depth_m DECIMAL(10, 2),
  volume_liters DECIMAL(15, 2),
  water_source TEXT,
  aeration_type TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'stocked', 'harvesting', 'empty', 'maintenance', 'inactive')),
  construction_date DATE,
  construction_cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Fish stocking records
CREATE TABLE IF NOT EXISTS fish_stocking_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pond_id UUID NOT NULL REFERENCES fish_ponds(id) ON DELETE CASCADE,
  production_item_id UUID NOT NULL REFERENCES production_items(id) ON DELETE CASCADE,
  stocking_date DATE NOT NULL,
  fish_species TEXT NOT NULL,
  fingerling_source TEXT,
  quantity INTEGER NOT NULL,
  average_weight_grams DECIMAL(10, 2),
  total_weight_kg DECIMAL(15, 2),
  unit_cost DECIMAL(15, 2),
  total_cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  expected_harvest_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'growing', 'ready_for_harvest', 'harvested', 'failed')),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Water quality records
CREATE TABLE IF NOT EXISTS water_quality_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pond_id UUID NOT NULL REFERENCES fish_ponds(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  record_time TIME,
  temperature_celsius DECIMAL(5, 2),
  ph_level DECIMAL(4, 2),
  dissolved_oxygen_mg_l DECIMAL(6, 2),
  ammonia_mg_l DECIMAL(6, 3),
  nitrite_mg_l DECIMAL(6, 3),
  nitrate_mg_l DECIMAL(6, 2),
  turbidity TEXT,
  water_color TEXT,
  water_level_cm DECIMAL(10, 2),
  actions_taken TEXT,
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fish feeding records
CREATE TABLE IF NOT EXISTS fish_feeding_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pond_id UUID NOT NULL REFERENCES fish_ponds(id) ON DELETE CASCADE,
  stocking_id UUID REFERENCES fish_stocking_records(id) ON DELETE SET NULL,
  feed_date DATE NOT NULL,
  feed_time TIME,
  feed_type TEXT NOT NULL,
  brand TEXT,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  cost_per_kg DECIMAL(15, 2),
  total_cost DECIMAL(15, 2),
  currency TEXT DEFAULT 'UGX',
  fish_response TEXT CHECK (fish_response IN ('excellent', 'good', 'moderate', 'poor', 'not_eating')),
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fish sampling/growth records
CREATE TABLE IF NOT EXISTS fish_sampling_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stocking_id UUID NOT NULL REFERENCES fish_stocking_records(id) ON DELETE CASCADE,
  sample_date DATE NOT NULL,
  fish_sampled INTEGER NOT NULL,
  average_weight_grams DECIMAL(10, 2),
  min_weight_grams DECIMAL(10, 2),
  max_weight_grams DECIMAL(10, 2),
  average_length_cm DECIMAL(10, 2),
  health_status TEXT CHECK (health_status IN ('excellent', 'good', 'fair', 'poor', 'diseased')),
  mortality_observed INTEGER DEFAULT 0,
  estimated_total_biomass_kg DECIMAL(15, 2),
  notes TEXT,
  recorded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fish harvest records
CREATE TABLE IF NOT EXISTS fish_harvest_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stocking_id UUID NOT NULL REFERENCES fish_stocking_records(id) ON DELETE CASCADE,
  pond_id UUID NOT NULL REFERENCES fish_ponds(id) ON DELETE CASCADE,
  harvest_date DATE NOT NULL,
  harvest_type TEXT CHECK (harvest_type IN ('partial', 'complete')),
  quantity_harvested INTEGER NOT NULL,
  total_weight_kg DECIMAL(15, 2) NOT NULL,
  average_weight_grams DECIMAL(10, 2),
  grade_a_kg DECIMAL(15, 2),
  grade_b_kg DECIMAL(15, 2),
  grade_c_kg DECIMAL(15, 2),
  mortality_during_harvest INTEGER DEFAULT 0,
  destination TEXT CHECK (destination IN ('processing', 'direct_sale', 'live_sale', 'storage')),
  notes TEXT,
  harvested_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_farm_zones_farm ON farm_zones(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_infrastructure_farm ON farm_infrastructure(farm_id);
CREATE INDEX IF NOT EXISTS idx_planting_batches_production ON planting_batches(production_item_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_batch ON growth_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_farm ON farm_activities(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_activities_date ON farm_activities(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_harvest_records_production ON harvest_records(production_item_id);
CREATE INDEX IF NOT EXISTS idx_livestock_batches_production ON livestock_batches(production_item_id);
CREATE INDEX IF NOT EXISTS idx_egg_production_batch ON egg_production_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_fish_ponds_farm ON fish_ponds(farm_id);
CREATE INDEX IF NOT EXISTS idx_fish_stocking_pond ON fish_stocking_records(pond_id);
CREATE INDEX IF NOT EXISTS idx_water_quality_pond ON water_quality_records(pond_id);

COMMIT;
