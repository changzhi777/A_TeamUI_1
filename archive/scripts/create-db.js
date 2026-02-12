const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
};

// 创建数据库
async function createDatabase() {
  try {
    console.log('🔌 连接到 MySQL...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL 连接成功');

    console.log('📦 创建数据库 a_teamui...');
    await connection.execute(
      "CREATE DATABASE IF NOT EXISTS a_teamui CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );
    console.log('✅ 数据库 a_teamui 创建成功');

    await connection.end();
    console.log('✅ 数据库创建完成');
    return true;
  } catch (error) {
    console.error('❌ 创建数据库失败:', error.message);
    return false;
  }
}

// 运行脚本
createDatabase().then(() => {
  console.log('\n📋 操作完成！');
  process.exit(0);
}).catch(() => {
  console.error('\n❌ 操作失败！');
  process.exit(1);
});
