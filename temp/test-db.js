const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '12345678',
  database: 'a_teamui'
};

// 测试数据库连接
async function testDatabase() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL 连接成功');
    await connection.end();
    console.log('✅ 数据库连接测试完成');
    return true;
  } catch (error) {
    console.error('❌ MySQL 连接失败:', error.message);
    return false;
  }
}

// 运行测试
testDatabase().then(() => {
  console.log('\n📋 测试完成！');
  process.exit(0);
}).catch(() => {
  console.error('\n❌ 测试失败！');
  process.exit(1);
});
