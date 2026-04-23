import express from 'express';                             // <--- Use 'import', not 'require'
const router = express.Router();
import db, { logAction } from '../database/database.js';

// ======================================================================================================================== //

// ID TO USER DETAILS ROUTE - PAGES THAT REQUIRE USER DATA 

router.get('/return-name/:id', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [req.params.id]);               // <--- Takes user ID from Specific Page and checks database for matching user
    if (rows.length > 0)                                                                              // <--- If a match is found - row is bigger then 0 
      res.json(rows[0]);                                                                              // <--- Returns the specific user's data to the Specific Page
    else {
      await logAction(req.params.id, 'USER_QUERY_FAIL', "User ID not found in database");             // <--- notification for admin
      res.json({ error: "User ID not found" });                                                       // <--- notification for react 
    }
  } catch (err) { res.json({ error: err.message }); }                                                 // <--- notification for react [Other Errors]
});

// ======================================================================================================================== //

// ======================================================================================================================== //

// USER-SPECIFIC ROUTE TO RETURN ALL PENDING TRADES 

router.get('/return-buffer/:userId', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM pending_transactions WHERE user_id = ?", [req.params.userId]);        // <--- Takes user ID and checks 'pending_transactions' table from dashboard.jsx
    res.json(rows);                                                                                                    // <--- Returns all pending trades for that user to dashboard.jsx
  } catch (err) { res.json([]); }                                                                                      // <--- notification for react [Other Errors]
});

// ======================================================================================================================== //

// ======================================================================================================================== //

// CLOSE A ACTIVE POSITION

router.put('/close-position/:id', async (req, res) => {
  const { exit_price } = req.body;                                                                                                                                        // <--- Takes exit price from dashboard.jsx when user closes a position
  try {
    const [trades] = await db.query("SELECT * FROM transactions WHERE transaction_id = ?", [req.params.id]);                                                              // <--- Checks transactions table for the specific trade ID to be closed
    if (trades.length === 0) return res.json({ error: "Trade not found." });                                                                                              // <--- If no trade is found with that ID, return error

    const { entry_price, quantity, type, user_id } = trades[0];                                                                                                           // <--- If trade is found, break down the trade details for P/L calculation
    let pnl = 0; 

    if (type === 'BUY') {                                                                                                                                                 // <--- For BUY trades, P/L is (Exit Price - Entry Price) * Quantity
      pnl = (exit_price - entry_price) * quantity;                                                                                                                        
    } else {                                                                                                                                                              // <--- For SELL trades, P/L is (Entry Price - Exit Price) * Quantity
      pnl = (entry_price - exit_price) * quantity;
    }

    await db.query("UPDATE transactions SET exit_price = ?, profit_loss = ?, status = 'CLOSED' WHERE transaction_id = ?", [exit_price, pnl, req.params.id]);              // <--- Update the trade in the database with the exit price, calculated P/L and change status to CLOSED

    await logAction(user_id, 'TRADE_CLOSED', `Position ${req.params.id} closed. P/L: £${pnl.toFixed(2)}`);                                                                // <--- notification for admin
    res.json({ message: "Position closed successfully", profit: pnl });                                                                                                   // <--- notification for react
  } catch (err) { res.json({ error: err.message }); }                                                                                                                     // <--- notification for react [Other Errors]
});

// ======================================================================================================================== //


// 1. RETURN TRANSACTIONS (FOR THE HISTORY TABLE)
router.get('/return-transactions/:userId', async (req, res) => {
  try {
    // REMOVED 'AND status = 'CLOSED'' so we get EVERYTHING (Open & Closed)
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

// ======================================================================================================================== //

// 2. RETURN ALL PENDING BUFFER TRADES (FOR THE STAGING AREA)
router.get('/return-buffer/:userId', async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM pending_transactions WHERE user_id = ?", 
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Buffer Fetch Error:", err);
    res.status(500).json([]);
  }
});

// ======================================================================================================================== //

export default router;