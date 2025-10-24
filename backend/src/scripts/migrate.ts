#!/usr/bin/env ts-node

import { MigrationRunner } from '../migrations/migration-runner';
import { pool, testConnection, closeDatabase } from '../config/database';

async function runMigrations() {
  console.log('🚀 開始資料庫遷移...');
  
  try {
    // 測試資料庫連線
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ 無法連接到資料庫，請檢查配置');
      process.exit(1);
    }

    // 執行遷移
    const migrationRunner = new MigrationRunner(pool);
    await migrationRunner.migrate();
    
    console.log('✅ 資料庫遷移完成');
  } catch (error) {
    console.error('❌ 遷移過程中發生錯誤:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// 如果直接執行此腳本
if (require.main === module) {
  runMigrations();
}

export { runMigrations };