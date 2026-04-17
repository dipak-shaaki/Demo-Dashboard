-- Nepal Insurance Dashboard Database Schema
-- Fiscal Year: 2081/82 (2024-2025)

CREATE DATABASE IF NOT EXISTS insurance_dashboard;
USE insurance_dashboard;

-- Provinces table (7 provinces of Nepal)
CREATE TABLE IF NOT EXISTS provinces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    province_id INT NOT NULL,
    agency_name VARCHAR(200),
    join_date DATE NOT NULL,
    status ENUM('active', 'inactive', 'passive') DEFAULT 'active',
    total_premium_collected DECIMAL(15, 2) DEFAULT 0.00,
    last_activity_date DATE,
    phone VARCHAR(20),
    email VARCHAR(100),
    FOREIGN KEY (province_id) REFERENCES provinces(id)
);

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_number VARCHAR(50) UNIQUE NOT NULL,
    agent_id INT NOT NULL,
    province_id INT NOT NULL,
    plan_type ENUM('term', 'endowment', 'money-back', 'whole-life') NOT NULL,
    premium_amount DECIMAL(15, 2) NOT NULL,
    sum_assured DECIMAL(15, 2) NOT NULL,
    issue_date DATE NOT NULL,
    maturity_date DATE,
    status ENUM('active', 'lapsed', 'surrendered', 'matured', 'claim') DEFAULT 'active',
    policyholder_name VARCHAR(200),
    policyholder_phone VARCHAR(20),
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    FOREIGN KEY (province_id) REFERENCES provinces(id)
);

-- Premium Collections table
CREATE TABLE IF NOT EXISTS premium_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    collection_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    fiscal_year VARCHAR(20) NOT NULL,
    payment_mode ENUM('cash', 'cheque', 'bank_transfer', 'online') DEFAULT 'cash',
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    claim_type ENUM('death', 'maturity', 'surrender', 'loan') NOT NULL,
    claim_date DATE NOT NULL,
    claim_amount DECIMAL(15, 2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    claim_description TEXT,
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);

-- Renewals table
CREATE TABLE IF NOT EXISTS renewals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT NOT NULL,
    renewal_date DATE NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    fiscal_year VARCHAR(20) NOT NULL,
    status ENUM('paid', 'pending', 'lapsed') DEFAULT 'pending',
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);

-- Investments table
CREATE TABLE IF NOT EXISTS investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_id INT,
    investment_type ENUM('FD', 'bonds', 'others') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    interest_rate DECIMAL(5, 2) NOT NULL,
    start_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    status ENUM('active', 'matured', 'withdrawn') DEFAULT 'active',
    FOREIGN KEY (policy_id) REFERENCES policies(id)
);

-- Index for better query performance
CREATE INDEX idx_policies_province ON policies(province_id);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_collections_fiscal_year ON premium_collections(fiscal_year);
CREATE INDEX idx_collections_date ON premium_collections(collection_date);
CREATE INDEX idx_claims_type ON claims(claim_type);
CREATE INDEX idx_renewals_fiscal_year ON renewals(fiscal_year);
CREATE INDEX idx_agents_status ON agents(status);
