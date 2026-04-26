import mysql from 'mysql2/promise';

const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  password: 'rootpassword',
  database: 'user_system'
});

console.log('Database Connected');

export const logAction = async (userId, action, details) => {
  try {
    const sql = "INSERT INTO system_logs (user_id, action, details) VALUES (?, ?, ?)";
    await db.query(sql, [userId || null, action, details]);
    console.log(`[ADMIN]: ${action} - ${details}`);
  } catch (err) {
    console.error("Logging Failure:", err.message);
  }
};

export default db;