import express from 'express';
const router = express.Router();
import db, { logAction } from '../database/database.js';
 
 
// RETURN USER DETAILS BY ID
router.get('/return-name/:id', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);
    if (rows.length > 0)
      res.json(rows[0]);
    else {
      await logAction(req.params.id, 'USER_QUERY_FAIL', "User ID not found in database");
      res.json({ error: "User ID not found" });
    }
  } catch (err) { res.json({ error: err.message }); }
});
 
 
// RETURN ALL PENDING BUFFER TRADES
router.get('/return-buffer/:userId', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pending_transactions WHERE user_id = ?", [req.params.userId]);
    res.json(rows);
  } catch (err) { res.json([]); }
});
 
 
// CLOSE AN ACTIVE POSITION
router.put('/close-position/:id', async (req, res) => {
  const { exit_price } = req.body;
  try {
    const [trades] = await db.query("SELECT * FROM transactions WHERE transaction_id = ?", [req.params.id]);
    if (trades.length === 0) return res.json({ error: "Trade not found." });
 
    const { entry_price, quantity, type, user_id } = trades[0];
    let pnl = 0;
 
    if (type === 'BUY') {
      pnl = (exit_price - entry_price) * quantity;
    } else {
      pnl = (entry_price - exit_price) * quantity;
    }
 
    await db.query("UPDATE transactions SET exit_price = ?, profit_loss = ?, status = 'CLOSED' WHERE transaction_id = ?", [exit_price, pnl, req.params.id]);
    await logAction(user_id, 'TRADE_CLOSED', `Position ${req.params.id} closed. P/L: £${pnl.toFixed(2)}`);
    res.json({ message: "Position closed successfully", profit: pnl });
  } catch (err) { res.json({ error: err.message }); }
});
 
 
// RETURN ALL TRANSACTIONS (OPEN AND CLOSED) FOR HISTORY TABLE
router.get('/return-transactions/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC",
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("History Fetch Error:", err);
    res.status(500).json([]);
  }
});
 
 
export default router;