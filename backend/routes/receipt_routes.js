import express from 'express';                             // <--- Use 'import', not 'require'
const router = express.Router();
import db, { logAction } from '../database/database.js';
import authenticateToken from '../middleware/authMiddleware.js';


// ======================================================================================================================== //

//============================================================ //
// TRADING OPERATIONS ROUTES //
//============================================================ //

// ======================================================================================================================== //

// SUBMIT TO BUFFER (PENDING APPROVAL) [BUY or SELL trade]

router.post('/submit-to-buffer', authenticateToken, async (req, res) => {
  const { user_id, symbol, type, entry_price, quantity } = req.body;
  
  // 1. Verify that the logged-in user matches the trade owner
  if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({ error: "Access Denied: You cannot submit trades for another user." });
  }

  try {
    const sql = `INSERT INTO pending_transactions (user_id, symbol, type, entry_price, quantity, status) 
                 VALUES (?, ?, ?, ?, ?, 'AWAITING AUTHORISATION')`;
    
    await db.query(sql, [user_id, symbol, type, entry_price, quantity]);
    
    await logAction(user_id, 'ORDER_PENDING', `User requested ${type} ${quantity}x ${symbol} at $${entry_price}`);
    res.json({ message: "Trade submitted for authorisation" });
    
  } catch (err) {
    await logAction(user_id, 'BUFFER_ERROR', `Failed to add trade to buffer: ${err.message}`);
    res.status(500).json({ error: "Database buffer error" });
  }
});

// ======================================================================================================================== //

// ======================================================================================================================== //

// RECEIPT-SPECIFIC USER DATA FETCH (FOR BALANCE & RISK CALCULATION)

router.get('/user-details/:id', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, full_name, balance FROM users WHERE id = ?", [req.params.id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      await logAction(req.params.id, 'RECEIPT_USER_FAIL', "User data fetch failed on Trade Ticket");
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    res.status(500).json({ error: "Database error: " + err.message });
  }
});

// ======================================================================================================================== //




// ======================================================================================================================== //





export default router;