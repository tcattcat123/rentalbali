-- MySQL схема для RentHome Bali
-- Применить: mysql -u root -p rentalbali < db/schema.sql

CREATE DATABASE IF NOT EXISTS rentalbali CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rentalbali;

-- ============================================
-- 1. АДМИНИСТРАТОРЫ (без регистрации пользователей)
-- Только админ может выкладывать объекты.
-- Пароль хранится как bcrypt/hash. ADMIN_SECRET задаётся в env Vercel.
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','moderator') DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. ПРОФИЛИ УЧАСТНИКОВ
-- Публичные / непубличные. Контакты видны только если public=1 или партнёр по договору.
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(64) PRIMARY KEY,
  num INT DEFAULT 0,
  name VARCHAR(120) NOT NULL,
  username VARCHAR(80) UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(60),
  city VARCHAR(120),
  role ENUM('owner','agent','notary','consultant','admin','buyer') DEFAULT 'owner',
  bio TEXT,
  public TINYINT(1) DEFAULT 0,
  avatar VARCHAR(500),
  -- Реквизиты профиля и их публичность (политика конфиденциальности)
  verification VARCHAR(20) DEFAULT 'email',
  alias VARCHAR(120),
  whatsapp VARCHAR(60),
  telegram VARCHAR(120),
  website VARCHAR(255),
  instagram VARCHAR(255),
  facebook VARCHAR(255),
  address VARCHAR(255),
  certificate MEDIUMTEXT,
  roles TEXT,
  public_fields TEXT,
  pass_plain VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 3. ОБЪЕКТЫ НЕДВИЖИМОСТИ (listings)
-- status: draft (черновик) / published (в ленте)
-- Только админ может создавать/редактировать.
-- ============================================
CREATE TABLE IF NOT EXISTS listings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  deal_type ENUM('rent','sale') NOT NULL,
  role ENUM('offer','request') NOT NULL,
  property_type ENUM('villa','house','apartment','room','invest','homestay','land','townhouse','boarding','commercial') NOT NULL,
  district VARCHAR(120),
  location VARCHAR(200),
  address VARCHAR(500),
  price BIGINT DEFAULT 0,
  price_min BIGINT DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'IDR',
  category ENUM('monthly','yearly') DEFAULT 'monthly',
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  area DECIMAL(10,2) DEFAULT 0,
  land_area DECIMAL(10,2) DEFAULT 0,
  floors INT DEFAULT 0,
  year_built INT DEFAULT 0,
  furnished TINYINT(1) DEFAULT 1,
  tenure ENUM('freehold','leasehold') DEFAULT 'freehold',
  lease_years INT DEFAULT 0,
  available DATE,
  geo_lat DECIMAL(10,6),
  geo_lng DECIMAL(10,6),
  geo_acc ENUM('exact','approx') DEFAULT 'exact',
  amenities JSON,
  images JSON,
  `desc` TEXT,
  parties JSON,
  status ENUM('draft','published') DEFAULT 'draft',
  code VARCHAR(40),
  mine TINYINT(1) DEFAULT 1,
  `user` TINYINT(1) DEFAULT 1,
  owner VARCHAR(64),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  views INT DEFAULT 0,
  ai TINYINT(1) DEFAULT 0,
  agent_name VARCHAR(120),
  is_verified TINYINT(1) DEFAULT 0,
  is_agent TINYINT(1) DEFAULT 0,
  is_top TINYINT(1) DEFAULT 0,
  is_urgent TINYINT(1) DEFAULT 0,
  legal TINYINT(1) DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  reviews INT DEFAULT 0,
  move_in DATE,
  UNIQUE KEY uk_code (code),
  INDEX idx_status (status),
  INDEX idx_deal_role (deal_type, role),
  INDEX idx_district (district),
  INDEX idx_price (price),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 4. ДОГОВОРЫ (contracts)
-- status: pending (на согласовании) / active (действующий) / finished (завершённый)
-- ============================================
CREATE TABLE IF NOT EXISTS contracts (
  id VARCHAR(64) PRIMARY KEY,
  parties JSON NOT NULL,
  projects JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending','active','finished') DEFAULT 'pending',
  created_by VARCHAR(64) DEFAULT NULL,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. ИЗБРАННОЕ (favorites)
-- ============================================
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  listing_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_fav (user_id, listing_id),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 6. АККАУНТЫ ПОЛЬЗОВАТЕЛЕЙ (логин + пароль)
-- Пароль хранится как scrypt-хеш (Node crypto).
-- profile_id — профиль участника, привязанный к аккаунту (u<id>).
-- ============================================
CREATE TABLE IF NOT EXISTS accounts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  login VARCHAR(80) NOT NULL UNIQUE,
  pass_hash VARCHAR(255) NOT NULL,
  name VARCHAR(120) NOT NULL,
  profile_id VARCHAR(64) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 7. СЕССИИ (долгие, со скользящим продлением)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  token CHAR(64) PRIMARY KEY,
  account_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  INDEX idx_account (account_id),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. ШАБЛОНЫ ФОРМЫ (личный кабинет)
-- ============================================
CREATE TABLE IF NOT EXISTS templates (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  account_id BIGINT NOT NULL,
  name VARCHAR(120),
  data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_account (account_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- Пример админа (пароль будет взят из env ADMIN_PASSWORD_HASH при инициализации)
-- ============================================
INSERT IGNORE INTO users (username, password_hash, role)
VALUES ('admin', '', 'admin');
