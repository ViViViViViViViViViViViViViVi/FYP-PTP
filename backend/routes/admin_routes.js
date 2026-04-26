import express from 'express';
const router = express.Router();
import db, { logAction } from '../database/database.js';




// SYSTEM LOGS FOR CONSOLE BOX
router.get('/logs', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 50");
    res.json(rows);
  } catch (err) { res.json([]); }
});


// PLATFORM STATS FOR REVENUE BOX
router.get('/platform-stats', async (req, res) => {
  try {
    const [profitRows] = await db.query("SELECT SUM(profit_loss) as total FROM transactions WHERE status = 'CLOSED'");
    const [userRows] = await db.query("SELECT COUNT(id) as count FROM users");
    res.json({ totalProfit: profitRows[0].total || 0, totalUsers: userRows[0].count || 0 });
  } catch (err) { res.json({ totalProfit: "error", totalUsers: "error" }); }
});


// TRADES TO BE REVIEWED BY THE ADMIN
router.get('/view-buffer', async (req, res) => {
  try {
    const sql = "SELECT pt.*, u.full_name FROM pending_transactions pt LEFT JOIN users u ON pt.user_id = u.id ORDER BY pt.created_at DESC";
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) { res.json([]); }
});


// ADMIN AUTHORISATION - MOVE TRADE FROM PENDING TO ACTIVE
router.post('/authorize-and-move/:id', async (req, res) => {
  try {
    const [tempData] = await db.query("SELECT * FROM pending_transactions WHERE id = ?", [req.params.id]);
    if (tempData.length === 0) return res.json({ error: "Not found" });
    const trade = tempData[0];

    await db.query("INSERT INTO transactions (user_id, symbol, type, entry_price, quantity, status) VALUES (?, ?, ?, ?, ?, 'OPEN')",
      [trade.user_id, trade.symbol, trade.type, trade.entry_price, trade.quantity]);

    await db.query("DELETE FROM pending_transactions WHERE id = ?", [req.params.id]);

    await logAction(null, 'ORDER_AUTHORISED', `Admin approved Trade ID: ${req.params.id}`);
    res.json({ message: "Authorized" });
  } catch (err) { res.json({ error: err.message }); }
});


// REJECT AND DELETE FROM BUFFER
router.post('/reject-buffer-trade/:id', async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM pending_transactions WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.json({ error: "Trade not found" });

    await logAction(null, 'ORDER_REJECTED', `Admin deleted Trade ID: ${req.params.id} from buffer`);
    res.json({ message: "Trade rejected" });
  } catch (err) { res.json({ error: err.message }); }
});


// VIEW ALL REGISTERED USERS
router.get('/users', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, full_name, email, balance FROM users");
    res.json(rows);
  } catch (err) { res.json([]); }
});


export default router;