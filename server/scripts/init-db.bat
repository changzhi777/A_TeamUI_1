@echo off
REM Database initialization script for A_TeamUI (Windows)
REM This script sets up MySQL database and user with correct authentication

echo ======================================
echo A_TeamUI Database Initialization
echo ======================================
echo.

set DB_USER=ateamui
set DB_PASSWORD=ateamui_password
set DB_NAME=a_teamui
set ROOT_PASSWORD=password

echo Configuration:
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo   Root password: p***word
echo.

echo Checking MySQL connection...
mysql -u root -p%ROOT_PASSWORD% -e "SELECT 1;" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Cannot connect to MySQL with root user.
    echo        Please check your MySQL installation and root password.
    echo.
    echo You can also run the SQL commands manually:
    echo.
    echo   1. Open MySQL Command Line Client
    echo   2. Run the commands in scripts/init-db.sql
    echo.
    pause
    exit /b 1
)
echo [OK] MySQL is running
echo.

echo Creating database and user...
mysql -u root -p%ROOT_PASSWORD% < "%~dp0init-db.sql"
if errorlevel 1 (
    echo [ERROR] Failed to create database and user
    pause
    exit /b 1
)
echo [OK] Database and user created successfully
echo.

echo ======================================
echo Update your .env file with:
echo   DB_USER=%DB_USER%
echo   DB_PASSWORD=%DB_PASSWORD%
echo   DB_NAME=%DB_NAME%
echo ======================================
echo.

echo Database initialization complete!
pause
