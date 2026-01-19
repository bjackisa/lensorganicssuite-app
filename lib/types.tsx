// Lens Organics Suite - TypeScript Types

// =====================================================
// USER & AUTHENTICATION TYPES
// =====================================================

export type UserRole = 'super_admin' | 'managing_director' | 'field_manager' | 'processing_manager' | 'accountant';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role_id: string;
  role?: Role;
  is_active: boolean;
  avatar_url?: string;
  national_id?: string;
  address?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Record<string, boolean | string[]>;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  module: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

// =====================================================
// FARM TYPES
// =====================================================

export type FarmStatus = 'active' | 'inactive' | 'discontinued';

export interface Farm {
  id: string;
  name: string;
  location?: string;
  code: string;
  status: FarmStatus;
  total_acreage?: number;
  description?: string;
  gps_coordinates?: string;
  soil_type?: string;
  water_source?: string;
  electricity_available?: boolean;
  manager_id?: string;
  manager?: User;
  contact_phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmZone {
  id: string;
  farm_id: string;
  farm?: Farm;
  name: string;
  code: string;
  zone_type: 'cultivation' | 'livestock' | 'aquaculture' | 'processing' | 'storage' | 'residential' | 'other';
  acreage?: number;
  gps_coordinates?: string;
  soil_type?: string;
  irrigation_type?: string;
  status: 'active' | 'inactive' | 'fallow' | 'under_preparation';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FarmAssignment {
  id: string;
  user_id: string;
  farm_id: string;
  user?: User;
  farm?: Farm;
  assigned_at: string;
}

// =====================================================
// CROP & PRODUCTION TYPES
// =====================================================

export type CropType = 'crop' | 'livestock' | 'fish';
export type ProductionStatus = 'active' | 'inactive' | 'discontinued';
export type LifecycleStage = 'farm' | 'processing' | 'sale';

export interface CropTypeRecord {
  id: string;
  name: string;
  type: CropType;
  description?: string;
  scientific_name?: string;
  growth_duration_days?: number;
  optimal_temperature_min?: number;
  optimal_temperature_max?: number;
  water_requirements?: string;
  soil_requirements?: string;
  harvest_method?: string;
  storage_requirements?: string;
  icon_name?: string;
  color_code?: string;
  created_at: string;
}

export interface CropVariety {
  id: string;
  crop_type_id: string;
  crop_type?: CropTypeRecord;
  name: string;
  description?: string;
  origin?: string;
  yield_per_acre?: number;
  yield_unit?: string;
  maturity_days?: number;
  disease_resistance?: string;
  special_characteristics?: string;
  created_at: string;
}

export interface ProductionItem {
  id: string;
  farm_id: string;
  farm?: Farm;
  crop_type_id: string;
  crop_type?: CropTypeRecord;
  status: ProductionStatus;
  farm_stage_active: boolean;
  processing_stage_active: boolean;
  sale_stage_active: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PlantingBatch {
  id: string;
  production_item_id: string;
  production_item?: ProductionItem;
  zone_id?: string;
  zone?: FarmZone;
  variety_id?: string;
  variety?: CropVariety;
  batch_code: string;
  planting_date: string;
  expected_harvest_date?: string;
  actual_harvest_date?: string;
  quantity_planted?: number;
  quantity_unit?: string;
  area_planted?: number;
  area_unit?: string;
  seed_source?: string;
  seed_cost?: number;
  status: 'preparing' | 'planted' | 'growing' | 'flowering' | 'fruiting' | 'ready_for_harvest' | 'harvesting' | 'harvested' | 'failed';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthRecord {
  id: string;
  batch_id: string;
  batch?: PlantingBatch;
  record_date: string;
  growth_stage?: string;
  height_cm?: number;
  health_status?: 'excellent' | 'good' | 'fair' | 'poor' | 'diseased' | 'pest_affected';
  pest_observations?: string;
  disease_observations?: string;
  weather_conditions?: string;
  temperature_high?: number;
  temperature_low?: number;
  rainfall_mm?: number;
  humidity_percent?: number;
  actions_taken?: string;
  photos?: string[];
  recorded_by: string;
  created_at: string;
}

export interface FarmActivity {
  id: string;
  farm_id: string;
  farm?: Farm;
  zone_id?: string;
  zone?: FarmZone;
  batch_id?: string;
  batch?: PlantingBatch;
  production_item_id?: string;
  production_item?: ProductionItem;
  activity_type: 'planting' | 'watering' | 'fertilizing' | 'weeding' | 'pruning' | 'pest_control' | 'disease_treatment' | 'harvesting' | 'soil_preparation' | 'irrigation_maintenance' | 'general_maintenance' | 'inspection' | 'other';
  title: string;
  description?: string;
  scheduled_date?: string;
  completed_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  assigned_user?: User;
  completed_by?: string;
  labor_hours?: number;
  materials_used?: Record<string, any>;
  cost?: number;
  currency?: string;
  notes?: string;
  photos?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface HarvestRecord {
  id: string;
  batch_id?: string;
  batch?: PlantingBatch;
  production_item_id: string;
  production_item?: ProductionItem;
  zone_id?: string;
  zone?: FarmZone;
  harvest_date: string;
  quantity: number;
  unit: string;
  quality_grade?: 'A' | 'B' | 'C' | 'reject';
  quality_notes?: string;
  storage_location?: string;
  destination?: 'processing' | 'direct_sale' | 'storage' | 'internal_use' | 'waste';
  labor_hours?: number;
  workers_count?: number;
  weather_conditions?: string;
  harvested_by?: string;
  notes?: string;
  photos?: string[];
  created_at: string;
}

// =====================================================
// LIVESTOCK TYPES
// =====================================================

export interface LivestockBatch {
  id: string;
  production_item_id: string;
  production_item?: ProductionItem;
  zone_id?: string;
  zone?: FarmZone;
  batch_code: string;
  breed?: string;
  source?: string;
  acquisition_date: string;
  acquisition_type?: 'purchase' | 'hatched' | 'born' | 'transferred';
  initial_count: number;
  current_count: number;
  age_at_acquisition_days?: number;
  unit_cost?: number;
  total_cost?: number;
  currency?: string;
  status: 'active' | 'sold' | 'culled' | 'deceased' | 'transferred';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface LivestockHealthRecord {
  id: string;
  batch_id: string;
  batch?: LivestockBatch;
  record_date: string;
  record_type: 'vaccination' | 'medication' | 'health_check' | 'disease_outbreak' | 'mortality' | 'treatment' | 'deworming' | 'other';
  description: string;
  medication_name?: string;
  dosage?: string;
  administered_by?: string;
  veterinarian_name?: string;
  affected_count?: number;
  mortality_count?: number;
  cost?: number;
  currency?: string;
  next_due_date?: string;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

export interface EggProductionRecord {
  id: string;
  batch_id: string;
  batch?: LivestockBatch;
  production_date: string;
  total_eggs: number;
  grade_a_count?: number;
  grade_b_count?: number;
  broken_count?: number;
  collection_time?: string;
  bird_count?: number;
  production_rate?: number;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

export interface FeedRecord {
  id: string;
  batch_id: string;
  batch?: LivestockBatch;
  feed_date: string;
  feed_type: string;
  brand?: string;
  quantity: number;
  unit: string;
  cost_per_unit?: number;
  total_cost?: number;
  currency?: string;
  feeding_time?: string;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

// =====================================================
// AQUACULTURE (FISH) TYPES
// =====================================================

export interface FishPond {
  id: string;
  farm_id: string;
  farm?: Farm;
  zone_id?: string;
  zone?: FarmZone;
  name: string;
  pond_code: string;
  pond_type?: 'earthen' | 'concrete' | 'liner' | 'tank' | 'cage';
  length_m?: number;
  width_m?: number;
  depth_m?: number;
  volume_liters?: number;
  water_source?: string;
  aeration_type?: string;
  status: 'active' | 'stocked' | 'harvesting' | 'empty' | 'maintenance' | 'inactive';
  construction_date?: string;
  construction_cost?: number;
  currency?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface FishStockingRecord {
  id: string;
  pond_id: string;
  pond?: FishPond;
  production_item_id: string;
  production_item?: ProductionItem;
  stocking_date: string;
  fish_species: string;
  fingerling_source?: string;
  quantity: number;
  average_weight_grams?: number;
  total_weight_kg?: number;
  unit_cost?: number;
  total_cost?: number;
  currency?: string;
  expected_harvest_date?: string;
  status: 'active' | 'growing' | 'ready_for_harvest' | 'harvested' | 'failed';
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WaterQualityRecord {
  id: string;
  pond_id: string;
  pond?: FishPond;
  record_date: string;
  record_time?: string;
  temperature_celsius?: number;
  ph_level?: number;
  dissolved_oxygen_mg_l?: number;
  ammonia_mg_l?: number;
  nitrite_mg_l?: number;
  nitrate_mg_l?: number;
  turbidity?: string;
  water_color?: string;
  water_level_cm?: number;
  actions_taken?: string;
  notes?: string;
  recorded_by: string;
  created_at: string;
}

// =====================================================
// PROCESSING TYPES
// =====================================================

export interface ProcessingPlant {
  id: string;
  farm_id: string;
  farm?: Farm;
  name: string;
  plant_type: string;
  capacity?: number;
  capacity_unit?: string;
  status: 'active' | 'inactive' | 'maintenance';
  location?: string;
  manager_id?: string;
  manager?: User;
  operating_hours?: string;
  power_requirements?: string;
  water_requirements?: string;
  certifications?: Record<string, any>;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessingRun {
  id: string;
  plant_id: string;
  plant?: ProcessingPlant;
  production_item_id: string;
  production_item?: ProductionItem;
  batch_code: string;
  run_date: string;
  start_time?: string;
  end_time?: string;
  input_source?: 'harvest' | 'storage' | 'purchase' | 'transfer';
  input_batch_reference?: string;
  input_quantity: number;
  input_unit: string;
  input_quality_grade?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  supervisor_id?: string;
  supervisor?: User;
  workers_count?: number;
  labor_hours?: number;
  energy_consumed?: number;
  energy_unit?: string;
  water_consumed?: number;
  water_unit?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProcessingOutput {
  id: string;
  run_id: string;
  run?: ProcessingRun;
  output_type: string;
  product_name: string;
  quantity: number;
  unit: string;
  quality_grade?: 'premium' | 'A' | 'B' | 'C' | 'reject';
  batch_number?: string;
  production_date?: string;
  expiry_date?: string;
  storage_location?: string;
  storage_conditions?: string;
  packaging_type?: string;
  packages_count?: number;
  unit_weight?: number;
  notes?: string;
  created_at: string;
}

export interface OilExtractionRecord {
  id: string;
  run_id: string;
  run?: ProcessingRun;
  distillation_method?: 'steam' | 'hydro' | 'steam_hydro';
  distillation_duration_hours?: number;
  temperature_celsius?: number;
  pressure_bar?: number;
  oil_yield_ml?: number;
  oil_yield_percentage?: number;
  floral_water_yield_liters?: number;
  oil_density?: number;
  oil_color?: string;
  oil_clarity?: string;
  citral_content_percentage?: number;
  quality_test_results?: Record<string, any>;
  notes?: string;
  created_at: string;
}

// =====================================================
// EMPLOYEE TYPES
// =====================================================

export type EmploymentStatus = 'active' | 'inactive' | 'suspended';
export type ContractType = 'permanent' | 'contract' | 'casual' | 'seasonal' | 'intern';
export type PaymentMethod = 'cash' | 'bank_transfer' | 'mobile_money' | 'cheque';

export interface Employee {
  id: string;
  farm_id: string;
  farm?: Farm;
  employee_code?: string;
  full_name: string;
  email?: string;
  phone?: string;
  position: string;
  employment_status: EmploymentStatus;
  hire_date?: string;
  base_salary?: number;
  salary_currency?: string;
  department?: string;
  national_id?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  marital_status?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  bank_name?: string;
  bank_account_number?: string;
  mobile_money_number?: string;
  payment_method?: PaymentMethod;
  contract_type?: ContractType;
  contract_start_date?: string;
  contract_end_date?: string;
  probation_end_date?: string;
  termination_date?: string;
  termination_reason?: string;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  manager_id?: string;
  manager?: Employee;
  parent_department_id?: string;
  parent_department?: Department;
  created_at: string;
  updated_at: string;
}

export interface EmployeeAttendance {
  id: string;
  employee_id: string;
  employee?: Employee;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  check_in_time?: string;
  check_out_time?: string;
  hours_worked?: number;
  overtime_hours?: number;
  location?: string;
  gps_coordinates?: string;
  verification_method?: 'manual' | 'biometric' | 'mobile' | 'card';
  notes?: string;
  recorded_by?: string;
  created_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee?: Employee;
  leave_type_id: string;
  leave_type?: LeaveType;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approved_by?: string;
  approval_date?: string;
  rejection_reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  days_per_year?: number;
  is_paid: boolean;
  requires_approval: boolean;
  created_at: string;
}

export interface Payroll {
  id: string;
  employee_id: string;
  employee?: Employee;
  pay_period_start: string;
  pay_period_end: string;
  base_salary?: number;
  overtime_hours?: number;
  overtime_rate?: number;
  overtime_amount?: number;
  allowances?: Record<string, number>;
  total_allowances?: number;
  deductions?: number;
  deductions_breakdown?: Record<string, number>;
  bonuses?: number;
  tax_amount?: number;
  nssf_contribution?: number;
  gross_salary?: number;
  net_salary?: number;
  currency?: string;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  payment_date?: string;
  payment_reference?: string;
  approved_by?: string;
  paid_by?: string;
  notes?: string;
  created_at: string;
}

// =====================================================
// EQUIPMENT TYPES
// =====================================================

export type EquipmentStatus = 'active' | 'maintenance' | 'inactive';

export interface Equipment {
  id: string;
  farm_id: string;
  farm?: Farm;
  name: string;
  equipment_type: string;
  serial_number?: string;
  purchase_date?: string;
  purchase_price?: number;
  status: EquipmentStatus;
  location?: string;
  manufacturer?: string;
  model?: string;
  year_manufactured?: number;
  warranty_expiry?: string;
  depreciation_method?: 'straight_line' | 'declining_balance' | 'none';
  useful_life_years?: number;
  salvage_value?: number;
  current_value?: number;
  last_service_date?: string;
  next_service_date?: string;
  service_interval_days?: number;
  fuel_type?: string;
  fuel_capacity?: number;
  operating_hours?: number;
  odometer_reading?: number;
  assigned_to?: string;
  assigned_employee?: Employee;
  photo_url?: string;
  qr_code?: string;
  documents?: Record<string, any>;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface EquipmentMaintenance {
  id: string;
  equipment_id: string;
  equipment?: Equipment;
  maintenance_date: string;
  maintenance_type: string;
  maintenance_category?: 'preventive' | 'corrective' | 'emergency' | 'upgrade';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date?: string;
  completed_date?: string;
  description?: string;
  cost?: number;
  currency?: string;
  downtime_hours?: number;
  parts_used?: Record<string, any>;
  labor_hours?: number;
  labor_cost?: number;
  parts_cost?: number;
  performed_by?: string;
  vendor_name?: string;
  invoice_number?: string;
  next_maintenance_date?: string;
  photos?: string[];
  notes?: string;
  created_at: string;
}

// =====================================================
// FINANCIAL TYPES
// =====================================================

export type TransactionType = 'income' | 'expense';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled';

export interface Invoice {
  id: string;
  invoice_number: string;
  invoice_type?: 'sale' | 'proforma' | 'credit_note';
  farm_id: string;
  farm?: Farm;
  created_by: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  customer_tin?: string;
  issue_date: string;
  due_date?: string;
  currency: string;
  subtotal?: number;
  tax_rate?: number;
  tax?: number;
  discount_type?: 'percentage' | 'fixed';
  discount_value?: number;
  discount_amount?: number;
  shipping_cost?: number;
  total_amount?: number;
  amount_paid?: number;
  balance_due?: number;
  status: InvoiceStatus;
  payment_terms?: string;
  bank_account_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  invoice?: Invoice;
  item_type?: 'product' | 'service' | 'other';
  product_name: string;
  description?: string;
  sku?: string;
  quantity?: number;
  unit?: string;
  unit_price?: number;
  tax_rate?: number;
  tax_amount?: number;
  discount?: number;
  total?: number;
  production_item_id?: string;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  receipt_type?: 'payment' | 'deposit' | 'refund';
  farm_id: string;
  farm?: Farm;
  received_by: string;
  payer_name: string;
  payer_contact?: string;
  receipt_date: string;
  currency: string;
  amount?: number;
  payment_method?: PaymentMethod;
  invoice_id?: string;
  invoice?: Invoice;
  bank_account_id?: string;
  reference_number?: string;
  description?: string;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  farm_id: string;
  farm?: Farm;
  expense_number?: string;
  expense_date: string;
  category: string;
  subcategory?: string;
  chart_account_id?: string;
  vendor_name?: string;
  vendor_contact?: string;
  description: string;
  amount: number;
  tax_amount?: number;
  total_amount: number;
  currency: string;
  payment_method?: PaymentMethod;
  payment_status?: 'pending' | 'paid' | 'partial';
  bank_account_id?: string;
  reference_number?: string;
  receipt_url?: string;
  is_recurring?: boolean;
  recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_occurrence?: string;
  approved_by?: string;
  notes?: string;
  recorded_by: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  customer_code?: string;
  customer_type?: 'individual' | 'business' | 'government' | 'ngo';
  company_name?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  alternate_phone?: string;
  address?: string;
  city?: string;
  country?: string;
  tin_number?: string;
  payment_terms?: number;
  credit_limit?: number;
  currency?: string;
  preferred_payment_method?: PaymentMethod;
  bank_name?: string;
  bank_account?: string;
  mobile_money_number?: string;
  is_active: boolean;
  notes?: string;
  tags?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerOrder {
  id: string;
  order_number: string;
  customer_id: string;
  customer?: Customer;
  farm_id?: string;
  farm?: Farm;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  currency: string;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  shipping_cost?: number;
  total_amount?: number;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid';
  delivery_address?: string;
  delivery_notes?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// =====================================================
// INVENTORY TYPES
// =====================================================

export interface Inventory {
  id: string;
  farm_id: string;
  farm?: Farm;
  plant_id?: string;
  plant?: ProcessingPlant;
  item_type: 'raw_material' | 'processed_product' | 'byproduct' | 'packaging' | 'input' | 'equipment_part' | 'other';
  item_name: string;
  sku?: string;
  batch_number?: string;
  quantity: number;
  unit: string;
  unit_cost?: number;
  total_value?: number;
  currency?: string;
  storage_location?: string;
  storage_conditions?: string;
  production_date?: string;
  expiry_date?: string;
  reorder_level?: number;
  reorder_quantity?: number;
  supplier?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired' | 'reserved' | 'damaged';
  last_updated: string;
  created_at: string;
}

// =====================================================
// NOTIFICATION TYPES
// =====================================================

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success' | 'reminder';
  category?: string;
  reference_type?: string;
  reference_id?: string;
  is_read: boolean;
  read_at?: string;
  action_url?: string;
  created_at: string;
}

// =====================================================
// SYNC TYPES
// =====================================================

export interface SyncQueueItem {
  id: string;
  user_id: string;
  device_id?: string;
  operation: 'create' | 'update' | 'delete';
  table_name: string;
  record_id?: string;
  data: Record<string, any>;
  status: 'pending' | 'syncing' | 'synced' | 'failed' | 'conflict';
  conflict_data?: Record<string, any>;
  error_message?: string;
  retry_count: number;
  created_at: string;
  synced_at?: string;
}

// =====================================================
// DASHBOARD & REPORT TYPES
// =====================================================

export interface DashboardStats {
  activeFarms: number;
  activeCrops: number;
  totalEmployees: number;
  totalEquipment: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  pendingOrders: number;
  lowStockItems: number;
}

export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  invoiceCount: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

export interface FarmSummary {
  farm: Farm;
  activeProductions: number;
  pendingActivities: number;
  recentHarvests: number;
  employeeCount: number;
  equipmentCount: number;
}
