import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

export interface Migration {
  id: string;
  name: string;
  up: string;
  down: string;
}

export class MigrationRunner {
  private pool: Pool;

  constructor(dbPool: Pool) {
    this.pool = dbPool;
  }

  // 建立遷移記錄表
  async createMigrationsTable(): Promise<void> {
    const query = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        migration_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await this.pool.query(query);
  }

  // 取得已執行的遷移
  async getExecutedMigrations(): Promise<string[]> {
    const result = await this.pool.query(
      'SELECT migration_id FROM migrations ORDER BY executed_at'
    );
    return result.rows.map(row => row.migration_id);
  }

  // 執行遷移
  async runMigration(migration: Migration): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 執行遷移SQL
      await client.query(migration.up);
      
      // 記錄遷移
      await client.query(
        'INSERT INTO migrations (migration_id, name) VALUES ($1, $2)',
        [migration.id, migration.name]
      );
      
      await client.query('COMMIT');
      console.log(`✅ 遷移 ${migration.id} - ${migration.name} 執行成功`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ 遷移 ${migration.id} 執行失敗:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  // 回滾遷移
  async rollbackMigration(migration: Migration): Promise<void> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 執行回滾SQL
      await client.query(migration.down);
      
      // 移除遷移記錄
      await client.query(
        'DELETE FROM migrations WHERE migration_id = $1',
        [migration.id]
      );
      
      await client.query('COMMIT');
      console.log(`↩️ 遷移 ${migration.id} - ${migration.name} 回滾成功`);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(`❌ 遷移 ${migration.id} 回滾失敗:`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  // 執行所有待執行的遷移
  async migrate(): Promise<void> {
    await this.createMigrationsTable();
    
    const executedMigrations = await this.getExecutedMigrations();
    const allMigrations = this.loadMigrations();
    
    const pendingMigrations = allMigrations.filter(
      migration => !executedMigrations.includes(migration.id)
    );

    if (pendingMigrations.length === 0) {
      console.log('📋 沒有待執行的遷移');
      return;
    }

    console.log(`🚀 開始執行 ${pendingMigrations.length} 個遷移...`);
    
    for (const migration of pendingMigrations) {
      await this.runMigration(migration);
    }
    
    console.log('✅ 所有遷移執行完成');
  }

  // 載入遷移檔案
  private loadMigrations(): Migration[] {
    const migrationsDir = path.join(__dirname, 'sql');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files.map(file => {
      const filePath = path.join(migrationsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const [up, down] = content.split('-- DOWN');
      
      const id = file.replace('.sql', '');
      const name = id.replace(/^\d+_/, '').replace(/_/g, ' ');
      
      return {
        id,
        name,
        up: up.replace('-- UP', '').trim(),
        down: down ? down.trim() : ''
      };
    });
  }
}