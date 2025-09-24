const { Pool } = require("pg");

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Database operations
const dbOperations = {
  // Initialize database tables
  async initDatabase() {
    try {
      const client = await pool.connect();

      // Create refresh_tokens table
      await client.query(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
          id SERIAL PRIMARY KEY,
          token TEXT UNIQUE NOT NULL,
          username VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP NOT NULL
        )
      `);

      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert demo users if they don't exist
      await client.query(`
        INSERT INTO users (username) 
        VALUES ('Tamara'), ('Jim') 
        ON CONFLICT (username) DO NOTHING
      `);

      // Insert demo posts if they don't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS posts (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
          title TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (username) REFERENCES users(username)
        )
      `);

      await client.query(`
        INSERT INTO posts (username, title) 
        VALUES 
          ('Tamara', 'Post 1'),
          ('Jim', 'Post 2')
        ON CONFLICT DO NOTHING
      `);

      client.release();
      console.log("✅ PostgreSQL database initialized");
    } catch (error) {
      console.error("❌ Database initialization error:", error);
      throw error;
    }
  },

  // Add refresh token
  async addRefreshToken(token, username) {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

      await pool.query(
        "INSERT INTO refresh_tokens (token, username, expires_at) VALUES ($1, $2, $3)",
        [token, username, expiresAt]
      );
      return true;
    } catch (error) {
      console.error("❌ Add refresh token error:", error);
      return false;
    }
  },

  // Validate refresh token
  async validateRefreshToken(token) {
    try {
      const result = await pool.query(
        "SELECT username FROM refresh_tokens WHERE token = $1 AND expires_at > CURRENT_TIMESTAMP",
        [token]
      );
      return result.rows.length > 0 ? result.rows[0].username : null;
    } catch (error) {
      console.error("❌ Validate refresh token error:", error);
      return null;
    }
  },

  // Revoke refresh token
  async revokeRefreshToken(token) {
    try {
      const result = await pool.query(
        "DELETE FROM refresh_tokens WHERE token = $1",
        [token]
      );
      return result.rowCount > 0;
    } catch (error) {
      console.error("❌ Revoke refresh token error:", error);
      return false;
    }
  },

  // Cleanup expired tokens
  async cleanupExpiredTokens() {
    try {
      const result = await pool.query(
        "DELETE FROM refresh_tokens WHERE expires_at < CURRENT_TIMESTAMP"
      );
      console.log(`🧹 Cleaned up ${result.rowCount} expired tokens`);
    } catch (error) {
      console.error("❌ Cleanup expired tokens error:", error);
    }
  },

  // Get user tokens
  async getUserTokens(username) {
    try {
      const result = await pool.query(
        "SELECT token FROM refresh_tokens WHERE username = $1",
        [username]
      );
      return result.rows.map((row) => row.token);
    } catch (error) {
      console.error("❌ Get user tokens error:", error);
      return [];
    }
  },
};

// Cleanup expired tokens every hour
setInterval(() => {
  dbOperations.cleanupExpiredTokens();
}, 60 * 60 * 1000);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🔄 Shutting down database pool...");
  await pool.end();
  process.exit(0);
});

module.exports = { dbOperations, pool };
