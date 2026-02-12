#!/bin/bash

# Database initialization script for A_TeamUI
# This script sets up MySQL database and user with correct authentication

echo "🔧 A_TeamUI Database Initialization"
echo "======================================"
echo ""

# Default values
DB_USER="ateamui"
DB_PASSWORD="ateamui_password"
DB_NAME="a_teamui"
ROOT_PASSWORD="password"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -u|--user)
      DB_USER="$2"
      shift 2
      ;;
    -p|--password)
      DB_PASSWORD="$2"
      shift 2
      ;;
    -d|--database)
      DB_NAME="$2"
      shift 2
      ;;
    -r|--root-password)
      ROOT_PASSWORD="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  -u, --user USER          Database user (default: ateamui)"
      echo "  -p, --password PASSWORD    Database password (default: ateamui_password)"
      echo "  -d, --database NAME       Database name (default: a_teamui)"
      echo "  -r, --root-password PASS  MySQL root password (default: password)"
      echo "  -h, --help               Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use -h or --help for usage information"
      exit 1
      ;;
  esac
done

echo "Configuration:"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Root password: ${ROOT_PASSWORD:0:1}***"
echo ""

# Check if MySQL is running
echo "📡 Checking MySQL connection..."
if ! mysql -u root -p"$ROOT_PASSWORD" -e "SELECT 1;" &>/dev/null; then
    echo "❌ Cannot connect to MySQL with root user."
    echo "   Please check your MySQL installation and root password."
    exit 1
fi
echo "✅ MySQL is running"
echo ""

# Create database and user
echo "🔨 Creating database and user..."
mysql -u root -p"$ROOT_PASSWORD" <<EOF
-- Create database
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with mysql_native_password authentication
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED WITH mysql_native_password BY '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
EOF

if [ $? -eq 0 ]; then
    echo "✅ Database and user created successfully"
    echo ""
    echo "📝 Update your .env file with these credentials:"
    echo "   DB_HOST=localhost"
    echo "   DB_PORT=3306"
    echo "   DB_USER=$DB_USER"
    echo "   DB_PASSWORD=$DB_PASSWORD"
    echo "   DB_NAME=$DB_NAME"
else
    echo "❌ Failed to create database and user"
    exit 1
fi
