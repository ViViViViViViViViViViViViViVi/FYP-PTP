import express from 'express';                             
const router = express.Router();
import db, { logAction } from '../database/database.js';

// ======================================================================================================================== //

//============================================================ //
// ADMIN COMMAND CENTRE //
//============================================================ //

// ======================================================================================================================== //

// SYSTEM LOGS FOR CONSOLE BOX

router.get('/logs', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM system_logs ORDER BY created_at DESC LIMIT 50");              // <--- Fetches the latest 50 logs from the 'system_logs' table for the Admin Console Box
    res.json(rows);                                                                                            // <--- Returns the logs to Admin.jsx
  } catch (err) { res.json([]); }                                                                              // <--- notification for react [Other Errors]
});

// ======================================================================================================================== //

// PLATFORM STATS FOR REVENUE BOX

router.get('/platform-stats', async (req, res) => {
  try {
    const [profitRows] = await db.query("SELECT SUM(profit_loss) as total FROM transactions WHERE status = 'CLOSED'");               // <--- Calculates total profit by summing up all closed traddes in trasactions table
    const [userRows] = await db.query("SELECT COUNT(id) as count FROM users");                                                       // <--- Counts total number of registered users in users table
    res.json({ totalProfit: profitRows[0].total || 0, totalUsers: userRows[0].count || 0 });                                         // <--- Returns the platform stats to Admin.jsx
  } catch (err) { res.json({ totalProfit: "error", totalUsers: "error" }); }                                                         // <--- notification for react [Other Errors] sends error message instead of numbers .
});

// ======================================================================================================================== //

// TRADES TO BE REVIEWED BY THE ADMIN

router.get('/view-buffer', async (req, res) => {
  try {
    const sql = "SELECT pt.*, u.full_name FROM pending_transactions pt LEFT JOIN users u ON pt.user_id = u.id ORDER BY pt.created_at DESC";   // <--- Fetches all pending trades with the user's full name 
    const [rows] = await db.query(sql);                                                                                                       
    res.json(rows);                                                                                                                           // <--- Returns the pending trades to Admin.jsx
  } catch (err) { res.json([]); }                                                                                                             // <--- notification for react [Other Errors]   
});

// ======================================================================================================================== //

// ADMIN AUTHORIZATION - MOVE TRADE FROM PENDING AUTHORISATION TO ACTIVE 

router.post('/authorize-and-move/:id', async (req, res) => {
  try {
    const [tempData] = await db.query("SELECT * FROM pending_transactions WHERE id = ?", [req.params.id]);                                  // <--- Takes the trade ID from Admin.jsx and checks the pending_transactions table for that specific trade
    if (tempData.length === 0) return res.json({ error: "Not found" });                                                                     // <--- If no trade is found with that ID, return error
    const trade = tempData[0];                                                                                                              // <--- current trade which is being authorized by admin

    await db.query("INSERT INTO transactions (user_id, symbol, type, entry_price, quantity, status) VALUES (?, ?, ?, ?, ?, 'OPEN')",        // <--- talk to database to insert the trade into the transactions table with status OPEN [Active Trade]
      [trade.user_id, trade.symbol, trade.type, trade.entry_price, trade.quantity]);                                                        

    await db.query("DELETE FROM pending_transactions WHERE id = ?", [req.params.id]);                                                       // <--- After inserting into transactions table, delete the trade from pending_transactions table

    await logAction(null, 'ORDER_AUTHORISED', `Admin approved Trade ID: ${req.params.id}`);                                                 // <--- notification for admin
    res.json({ message: "Authorized" });                                                                                                    // <--- notification for react
  } catch (err) { res.json({ error: err.message }); }                                                                                       // <--- notification for react [Other Errors]
});

// ======================================================================================================================== //

// REJECT AND DELETE FROM BUFFER
router.post('/reject-buffer-trade/:id', async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM pending_transactions WHERE id = ?", [req.params.id]);                                      // <--- Takes the trade ID from Admin.jsx and attempts to delete it from the pending_transactions table              
    if (result.affectedRows === 0) return res.json({ error: "Trade not found" });                                                           // <--- If no trade is found with that ID then error is returned 

    await logAction(null, 'ORDER_REJECTED', `Admin deleted Trade ID: ${req.params.id} from buffer`);                                        // <--- notification for admin
    res.json({ message: "Trade rejected" });                                                                                                // <--- notification for react   
  } catch (err) { res.json({ error: err.message }); }                                                                                       // <--- notification for react [Other Errors]
});

// ======================================================================================================================== //

// VIEW ALL REGISTERED USERS

router.get('/users', async (req, res) => {                                         
  try {
    const [rows] = await db.query("SELECT id, full_name, email, balance FROM users");                                                       // <--- Fetches all registered users with their ID, full name, email and balance for the Admin Users List
    res.json(rows);                                                                                                                         // <--- Returns the users to Admin.jsx
  } catch (err) { res.json([]); }                                                                                                           // <--- notification for react [Other Errors]
});

// ======================================================================================================================== //

export default router;