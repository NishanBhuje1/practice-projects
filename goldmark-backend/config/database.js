import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Database configuration
const config = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "goldmark",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "password",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20, // maximum number of clients in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(config);

// Test connection
pool.on("connect", () => {
  console.log("🐘 Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("🚨 PostgreSQL connection error:", err);
  process.exit(-1);
});

// Helper function for database queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;

    if (process.env.NODE_ENV === "development") {
      console.log("📊 Query executed:", { text, duration, rows: res.rowCount });
    }

    return res;
  } catch (error) {
    console.error("🚨 Database query error:", error);
    throw error;
  }
};

// Helper function for transactions
export const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Helper function to get a client from the pool
export const getClient = () => pool.connect();

// Close pool (for graceful shutdown)
export const closePool = () => pool.end();

export default pool;
