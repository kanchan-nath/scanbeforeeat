-- =============================================================================
-- ScanBeforeEat Database Schema (MySQL 8.0+)
-- AI-Powered Food Ingredient Intelligence Platform
-- =============================================================================

CREATE DATABASE IF NOT EXISTS scanbeforeeat
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE scanbeforeeat;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100) NULL,
  email_verified_at TIMESTAMP NULL,
  account_status ENUM('active', 'suspended', 'pending_verification') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_status (account_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Persistent HTTP Sessions Table (for custom MySQL Session Store)
CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(128) PRIMARY KEY,
  expires INT UNSIGNED NOT NULL,
  data MEDIUMTEXT NULL,
  user_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sessions_expires (expires),
  INDEX idx_sessions_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Products Catalogue / Cache Table
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barcode VARCHAR(64) NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255) NULL,
  category VARCHAR(100) NULL,
  product_image_url TEXT NULL,
  ingredients_text MEDIUMTEXT NULL,
  nutrition_data_json JSON NULL,
  source_provider VARCHAR(50) NOT NULL DEFAULT 'open_food_facts',
  source_updated_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_barcode (barcode),
  INDEX idx_products_name (name),
  INDEX idx_products_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Canonical Ingredients Table
CREATE TABLE IF NOT EXISTS ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  normalized_name VARCHAR(255) NOT NULL UNIQUE,
  canonical_identifier VARCHAR(100) NULL,
  ingredient_category VARCHAR(100) NULL,
  general_description TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ingredients_name (normalized_name),
  INDEX idx_ingredients_canonical (canonical_identifier),
  INDEX idx_ingredients_category (ingredient_category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. User Scans Table
CREATE TABLE IF NOT EXISTS scans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NULL,
  scan_method ENUM('camera', 'upload', 'barcode', 'manual') NOT NULL,
  raw_ocr_text MEDIUMTEXT NULL,
  confirmed_ingredients_text MEDIUMTEXT NOT NULL,
  extraction_confidence DECIMAL(5,2) NULL,
  status ENUM('created', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'created',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_scans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_scans_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
  INDEX idx_scans_user (user_id),
  INDEX idx_scans_created_at (created_at),
  INDEX idx_scans_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Structured Analysis Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scan_id INT NOT NULL UNIQUE,
  user_id INT NOT NULL,
  schema_version VARCHAR(20) NOT NULL DEFAULT '1.0',
  analysis_provider VARCHAR(50) NOT NULL,
  model_identifier VARCHAR(100) NOT NULL,
  prompt_version VARCHAR(20) NOT NULL,
  scoring_methodology_version VARCHAR(20) NULL,
  overall_verdict VARCHAR(100) NOT NULL,
  overall_score INT NULL,
  report_json JSON NOT NULL,
  analysis_status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reports_scan FOREIGN KEY (scan_id) REFERENCES scans(id) ON DELETE CASCADE,
  CONSTRAINT fk_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_reports_user (user_id),
  INDEX idx_reports_created_at (created_at),
  INDEX idx_reports_verdict (overall_verdict),
  INDEX idx_reports_score (overall_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Report Ingredients Junction Table
CREATE TABLE IF NOT EXISTS report_ingredients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  ingredient_id INT NULL,
  original_label_text VARCHAR(255) NOT NULL,
  ingredient_order INT NOT NULL DEFAULT 0,
  identification_status ENUM('confirmed', 'probable', 'unknown') NOT NULL DEFAULT 'confirmed',
  category VARCHAR(100) NULL,
  function_text TEXT NULL,
  evidence_quality ENUM('strong', 'limited', 'none', 'context_dependent') NOT NULL DEFAULT 'limited',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rep_ing_report FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE,
  CONSTRAINT fk_rep_ing_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE SET NULL,
  INDEX idx_rep_ing_report (report_id),
  INDEX idx_rep_ing_ingredient (ingredient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. User Preferences (Dietary restrictions, allergens)
CREATE TABLE IF NOT EXISTS user_preferences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  allergens_json JSON NULL,
  dietary_tags_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_pref_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
