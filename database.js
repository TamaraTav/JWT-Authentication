const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Database file path
const dbPath = path.join(__dirname, "jwt_auth.db");

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database connection error:", err.message);
  } else {
    console.log("✅ Connected to SQLite database");
    initDatabase();
  }
});

// Initialize database tables
function initDatabase() {
  // Create refresh_tokens table
  const createTokensTable = `
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME,
      is_revoked BOOLEAN DEFAULT 0
    )
  `;

  // Create users table for future use
  const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `;

  db.run(createTokensTable, (err) => {
    if (err) {
      console.error("❌ Error creating tokens table:", err.message);
    } else {
      console.log("✅ Refresh tokens table ready");
    }
  });

  db.run(createUsersTable, (err) => {
    if (err) {
      console.error("❌ Error creating users table:", err.message);
    } else {
      console.log("✅ Users table ready");
    }
  });
}

// Database operations
const dbOperations = {
  // Add refresh token
  addRefreshToken: (token, username) => {
    return new Promise((resolve, reject) => {
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const sql = `
        INSERT INTO refresh_tokens (token, username, expires_at)
        VALUES (?, ?, ?)
      `;

      db.run(sql, [token, username, expiresAt.toISOString()], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      });
    });
  },

  // Check if refresh token exists and is valid
  validateRefreshToken: (token) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT username, is_revoked, expires_at
        FROM refresh_tokens
        WHERE token = ? AND is_revoked = 0
      `;

      db.get(sql, [token], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null); // Token not found
        } else {
          // Check if token is expired
          const expiresAt = new Date(row.expires_at);
          if (expiresAt < new Date()) {
            resolve(null); // Token expired
          } else {
            resolve(row.username);
          }
        }
      });
    });
  },

  // Revoke refresh token (logout)
  revokeRefreshToken: (token) => {
    return new Promise((resolve, reject) => {
      const sql = `
        UPDATE refresh_tokens
        SET is_revoked = 1
        WHERE token = ?
      `;

      db.run(sql, [token], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  },

  // Clean up expired tokens
  cleanupExpiredTokens: () => {
    return new Promise((resolve, reject) => {
      const sql = `
        DELETE FROM refresh_tokens
        WHERE expires_at < datetime('now')
        OR is_revoked = 1
      `;

      db.run(sql, [], function (err) {
        if (err) {
          reject(err);
        } else {
          console.log(`🧹 Cleaned up ${this.changes} expired/revoked tokens`);
          resolve(this.changes);
        }
      });
    });
  },

  // Get all active tokens for a user
  getUserTokens: (username) => {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT token, created_at, expires_at
        FROM refresh_tokens
        WHERE username = ? AND is_revoked = 0 AND expires_at > datetime('now')
      `;

      db.all(sql, [username], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  },
};

// Cleanup expired tokens every hour
setInterval(() => {
  dbOperations.cleanupExpiredTokens().catch((err) => {
    console.error("❌ Error cleaning up tokens:", err.message);
  });
}, 60 * 60 * 1000); // 1 hour

// Graceful shutdown
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("❌ Error closing database:", err.message);
    } else {
      console.log("✅ Database connection closed");
    }
    process.exit(0);
  });
});

module.exports = { db, dbOperations };
