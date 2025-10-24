#!/bin/bash

echo "🔧 修正資料庫檔名編碼問題 (改進版)"
echo "================================"
echo ""

# 檢查 Docker 容器是否運行
if ! docker ps | grep -q fsvs-postgres; then
    echo "❌ PostgreSQL 容器未運行"
    echo "請先啟動服務: docker compose up -d"
    exit 1
fi

echo "📊 步驟 1: 檢查當前資料庫中的檔名"
echo "--------------------------------"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
SELECT 
    document_id,
    file_name,
    CASE 
        WHEN file_name ~ '[^\x00-\x7F]' THEN '需要修正'
        ELSE '正常'
    END as status
FROM student_documents 
WHERE file_name IS NOT NULL
LIMIT 5;
"

echo ""
echo "📋 步驟 2: 使用 Node.js 進行編碼轉換"
echo "--------------------------------"
echo "正在準備轉換腳本..."

# 創建臨時 Node.js 腳本
cat > /tmp/fix-encoding.js << 'EOF'
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'foreign_student_verification',
  user: 'postgres',
  password: 'password',
});

async function fixEncoding() {
  const client = await pool.connect();
  
  try {
    // 開始交易
    await client.query('BEGIN');
    
    // 獲取所有需要修正的檔名
    const result = await client.query(`
      SELECT document_id, file_name 
      FROM student_documents 
      WHERE file_name IS NOT NULL 
      AND file_name ~ '[^\\x00-\\x7F]'
    `);
    
    console.log(`找到 ${result.rows.length} 個需要修正的檔名`);
    
    let fixed = 0;
    let failed = 0;
    
    for (const row of result.rows) {
      try {
        // 將錯誤編碼的字串轉回正確的 UTF-8
        const latin1Buffer = Buffer.from(row.file_name, 'latin1');
        const correctName = latin1Buffer.toString('utf8');
        
        // 更新資料庫
        await client.query(
          'UPDATE student_documents SET file_name = $1 WHERE document_id = $2',
          [correctName, row.document_id]
        );
        
        console.log(`✅ ${row.file_name} → ${correctName}`);
        fixed++;
      } catch (error) {
        console.error(`❌ 修正失敗: ${row.file_name}`, error.message);
        failed++;
      }
    }
    
    // 提交交易
    await client.query('COMMIT');
    
    console.log(`\n修正完成: ${fixed} 成功, ${failed} 失敗`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('修正過程發生錯誤:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixEncoding().catch(console.error);
EOF

echo "執行編碼轉換..."
docker exec fsvs-backend node /tmp/fix-encoding.js

echo ""
echo "✅ 步驟 3: 驗證修正結果"
echo "--------------------------------"
docker exec fsvs-postgres psql -U postgres -d foreign_student_verification -c "
SELECT 
    document_id,
    file_name as 檔名,
    length(file_name) as 字符數,
    octet_length(file_name) as 字節數
FROM student_documents 
WHERE file_name IS NOT NULL
ORDER BY uploaded_at DESC
LIMIT 5;
"

echo ""
echo "✨ 完成！"
