import mysql from 'mysql2/promise';
import { getDbConfig } from '../server/config/database.js';
import { env } from '../server/config/env.js';

async function testAivenConnection() {
  console.log('\n🔍 Testing Database Connection...');
  const config = getDbConfig();

  console.log('------------------------------------------------------');
  console.log(`Host:     ${config.host || 'socket'}`);
  console.log(`Port:     ${config.port || 'default'}`);
  console.log(`Database: ${config.database}`);
  console.log(`User:     ${config.user}`);
  console.log(`SSL:      ${config.ssl ? `Enabled (rejectUnauthorized: ${config.ssl.rejectUnauthorized})` : 'Disabled'}`);
  console.log('------------------------------------------------------\n');

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Successfully connected to database server!');

    const [versionRows] = await connection.query('SELECT VERSION() as version, CURRENT_USER() as user, DATABASE() as current_db');
    console.log(`📌 Server Version: ${versionRows[0]?.version}`);
    console.log(`📌 Authenticated As: ${versionRows[0]?.user}`);
    console.log(`📌 Current Database: ${versionRows[0]?.current_db}`);

    const [sslRows] = await connection.query("SHOW STATUS LIKE 'Ssl_cipher'");
    if (sslRows.length > 0 && sslRows[0].Value) {
      console.log(`🔒 SSL Cipher in use: ${sslRows[0].Value}`);
    }

    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    console.log(`📋 Existing tables (${tableNames.length}): ${tableNames.length > 0 ? tableNames.join(', ') : 'None yet (will be created automatically on start)'}`);

    await connection.end();
    console.log('\n🎉 Connection test passed! Your database configuration is valid.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed:');
    console.error(`   Message: ${error.message}`);
    console.error(`   Code:    ${error.code || 'N/A'}`);
    console.error(`   Errno:   ${error.errno || 'N/A'}`);

    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Tip: Check your DB_USER, DB_PASSWORD, and database permissions.');
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error('\n💡 Tip: Verify DB_HOST and DB_PORT. Ensure the Aiven service is running and accessible.');
    } else if (error.message.includes('SSL') || error.message.includes('certificate')) {
      console.error('\n💡 Tip: For Aiven MySQL, ensure DB_SSL=true and DB_SSL_REJECT_UNAUTHORIZED=false.');
    }
    console.log('');
    process.exit(1);
  }
}

testAivenConnection();

