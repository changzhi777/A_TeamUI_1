# Database Setup Guide

This guide explains how to set up the MySQL database for A_TeamUI backend server.

## Problem: MySQL Authentication Error

If you're seeing an error like:
```
Error: Server requests authentication using unknown plugin auth_gssapi_client
```

This means your MySQL user is using an authentication plugin that's not compatible with the `mysql2` Node.js library.

## Solution

You need to create a MySQL user with `mysql_native_password` authentication. Follow the instructions below for your platform.

## Option 1: Automated Setup (Windows)

1. Open Command Prompt as Administrator
2. Navigate to the scripts directory:
   ```
   cd C:\Users\Cz\Desktop\Code_cz\A_TeamUI\server\scripts
   ```
3. Run the initialization script:
   ```
   init-db.bat
   ```
4. The script will create a database and user with correct authentication

## Option 2: Automated Setup (Linux/Mac)

1. Open terminal
2. Navigate to the scripts directory:
   ```bash
   cd server/scripts
   ```
3. Make the script executable:
   ```bash
   chmod +x init-db.sh
   ```
4. Run the initialization script:
   ```bash
   ./init-db.sh
   ```

## Option 3: Manual Setup

If automated scripts don't work, you can manually run SQL commands:

1. Open MySQL Workbench or MySQL Command Line Client
2. Run the following SQL commands:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS a_teamui CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user with mysql_native_password authentication
CREATE USER IF NOT EXISTS 'ateamui'@'localhost' IDENTIFIED WITH mysql_native_password BY 'ateamui_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON a_teamui.* TO 'ateamui'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;
```

## Update .env File

After setting up the database, update your `.env` file with these credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=ateamui
DB_PASSWORD=ateamui_password
DB_NAME=a_teamui
```

## Verify Setup

After setup, you can verify the connection by running:

```bash
cd server
pnpm dev
```

You should see:
```
✅ Database connection established
🚀 Server running on http://localhost:3001
```

## Troubleshooting

### MySQL not running

Start MySQL service:
- **Windows**: Run `services.msc` and start "MySQL" service
- **Linux**: `sudo systemctl start mysql`
- **Mac**: `brew services start mysql`

### Access denied

Make sure you're using the correct root password for your MySQL installation.

### Port already in use

Check if port 3001 is available:
```bash
netstat -ano | findstr :3001
```

## Security Notes

⚠️ **For Development Only**

The default credentials (`ateamui`/`ateamui_password`) are for development only.

For production:
1. Use a strong password
2. Create a separate database user with limited privileges
3. Enable SSL for database connections
4. Use environment variables for sensitive data
