const bcrypt = require("bcryptjs");
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "ogastudent_db",
  user: process.env.DB_USER || "ogastudent",
  password: process.env.DB_PASSWORD || "ogastudent2024",
});

async function createAdmin() {
  try {
    const username = "admin";
    const email = "admin@ogastudent.com";
    const password = "admin123";
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `
      INSERT INTO users (username, email, password_hash, role, is_active, created_at, updated_at)
      VALUES ($1, $2, $3, $4, true, NOW(), NOW())
      ON CONFLICT (username) DO UPDATE 
      SET password_hash = EXCLUDED.password_hash, updated_at = NOW()
    `,
      [username, email, hash, "admin"]
    );

    console.log("✅ 管理員帳號創建成功:");
    console.log("   使用者名稱: admin");
    console.log("   密碼: admin123");
    console.log("   電子郵件: admin@ogastudent.com");
    console.log("   角色: admin");
  } catch (error) {
    console.error("❌ 創建失敗:", error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
