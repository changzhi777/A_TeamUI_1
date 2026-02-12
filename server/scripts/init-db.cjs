/**
 * Database initialization script for A_TeamUI
 * Run this script with: node scripts/init-db.js
 */

const mysql = require('mysql2/promise')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

// Default configuration
const config = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  dbName: 'a_teamui',
  newUser: 'ateamui',
  newPassword: 'ateamui_password'
}

async function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer)
    })
  })
}

async function initializeDatabase() {
  console.log('🔧 A_TeamUI Database Initialization')
  console.log('======================================')
  console.log('')
  console.log('This script will:')
  console.log('  1. Create database: ' + config.dbName)
  console.log('  2. Create user: ' + config.newUser)
  console.log('  3. Grant privileges')
  console.log('')
  console.log('Default configuration:')
  console.log('  Root user: ' + config.user)
  console.log('  Root password: password')
  console.log('')

  const confirm = await question('Continue with defaults? (y/n): ')

  if (confirm.toLowerCase() !== 'y') {
    const rootUser = await question('Enter MySQL root user: ')
    const rootPass = await question('Enter MySQL root password: ')
    const newUser = await question('Enter new database user name: ')
    const newPass = await question('Enter new database user password: ')
    const dbName = await question('Enter database name: ')

    if (rootUser) config.user = rootUser
    if (rootPass) config.password = rootPass
    if (newUser) config.newUser = newUser
    if (newPass) config.newPassword = newPass
    if (dbName) config.dbName = dbName
  }

  console.log('')
  console.log('📡 Connecting to MySQL...')

  try {
    // Test connection with root user
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password
    })

    console.log('✅ Connected to MySQL')
    console.log('')
    console.log('🔨 Creating database and user...')

    // Create database
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${config.dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    )
    console.log('✅ Database created: ' + config.dbName)

    // Create user with mysql_native_password
    await connection.query(
      `CREATE USER IF NOT EXISTS '${config.newUser}'@'localhost' IDENTIFIED WITH mysql_native_password BY '${config.newPassword}'`
    )
    console.log('✅ User created: ' + config.newUser)

    // Grant privileges
    await connection.query(
      `GRANT ALL PRIVILEGES ON \`${config.dbName}\`.* TO '${config.newUser}'@'localhost'`
    )
    console.log('✅ Privileges granted')

    // Flush privileges
    await connection.query('FLUSH PRIVILEGES')
    console.log('✅ Privileges flushed')

    await connection.end()

    console.log('')
    console.log('📝 Update your .env file with:')
    console.log('   DB_USER=' + config.newUser)
    console.log('   DB_PASSWORD=' + config.newPassword)
    console.log('   DB_NAME=' + config.dbName)
    console.log('')
    console.log('✅ Database initialization complete!')

  } catch (error) {
    console.error('')
    console.error('❌ Error:', error.message)
    console.error('')
    console.error('Please check:')
    console.error('  1. MySQL is running')
    console.error('  2. Root user and password are correct')
    console.error('  3. MySQL port (default: 3306)')
    process.exit(1)
  } finally {
    rl.close()
  }
}

initializeDatabase()
