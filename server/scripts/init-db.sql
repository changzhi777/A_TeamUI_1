-- Database initialization script for A_TeamUI
-- Run this in MySQL to set up the database and user with correct authentication

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS a_teamui CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE a_teamui;

-- Create user with mysql_native_password authentication
-- This avoids auth_gssapi_client issues with mysql2
CREATE USER IF NOT EXISTS 'ateamui'@'localhost' IDENTIFIED WITH mysql_native_password BY 'ateamui_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON a_teamui.* TO 'ateamui'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- For root user access, you can also run:
-- ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
-- FLUSH PRIVILEGES;
