const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'foreign_student_verification',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function fixFilenameEncoding() {
  console.log('🔧 開始修正檔名編碼...\n');
  
  const client = await pool.connect();
  
  try {
    // 備份
    console.log('💾 建立備份...');
    await client.query(`
      DROP TABLE IF EXISTS student_documents_backup_encoding;
      CREATE TABLE student_documents_backup_encoding AS 
      SELECT * FROM student_documents WHERE file_name IS NOT NULL;
    `);
    console.log('✅ 備份完成\n');
    
    // 獲取所有需要修正的檔名
    const result = await client.query(`
      SELECT document_id, file_name 
      FROM student_documents 
      WHERE file_name IS NOT NULL 
      AND file_name ~ '[^\\x00-\\x7F]'
    `);
    
    console.log(`📊 找到 ${result.rows.length} 個需要修正的檔名\n`);
    
    if (result.rows.length === 0) {
      console.log('✨ 沒有需要修正的檔名');
      return;
    }
    
    let fixed = 0;
    let failed = 0;
    
    console.log('🔄 開始修正...\n');
    
    for (const row of result.rows) {
      try {
        // 將錯誤編碼的字串轉回正確的 UTF-8
        // 原理：資料庫中儲存的是 UTF-8 字節被當作 Latin-1 字符
        // 我們需要將這些字符轉回字節，再用 UTF-8 解碼
        const latin1Buffer = Buffer.from(row.file_name, 'latin1');
        const correctName = latin1Buffer.toString('utf8');
        
        // 檢查是否包含 null 字節（會導致 PostgreSQL 錯誤）
        if (correctName.includes('\u0000')) {
          console.log(`⚠️  跳過（包含 null 字節）: ${row.file_name}\n`);
          failed++;
          continue;
        }
        
        // 更新資料庫（每個更新獨立執行）
        await client.query(
          'UPDATE student_documents SET file_name = $1 WHERE document_id = $2',
          [correctName, row.document_id]
        );
        
        console.log(`✅ ${row.file_name}`);
        console.log(`   → ${correctName}\n`);
        fixed++;
      } catch (error) {
        console.error(`❌ 修正失敗: ${row.file_name}`);
        console.error(`   錯誤: ${error.message}\n`);
        failed++;
      }
    }
    
    console.log(`\n✨ 修正完成！`);
    console.log(`   成功: ${fixed}`);
    console.log(`   失敗: ${failed}`);
    
    // 顯示修正後的結果
    console.log('\n📋 修正後的檔名（前5個）：');
    const verifyResult = await client.query(`
      SELECT file_name 
      FROM student_documents 
      WHERE file_name IS NOT NULL
      ORDER BY uploaded_at DESC
      LIMIT 5
    `);
    
    verifyResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.file_name}`);
    });
    
  } catch (error) {
    console.error('\n❌ 修正過程發生錯誤:', error);
    console.error('\n可以從備份還原:');
    console.error('   DELETE FROM student_documents;');
    console.error('   INSERT INTO student_documents SELECT * FROM student_documents_backup_encoding;');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// 執行修正
fixFilenameEncoding()
  .then(() => {
    console.log('\n✅ 腳本執行完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 腳本執行失敗:', error);
    process.exit(1);
  });
