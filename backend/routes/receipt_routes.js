import express from 'express';
const router = express.Router();
import db, { logAction } from '../database/database.js';
import authenticateToken from '../middleware/authMiddleware.js';
import jwt from 'jsonwebtoken';
const secretKey = 'your_super_secret_key';



// SUBMIT TRADE TO BUFFER 
router.post('/submit-to-buffer', authenticateToken, async (req, res) => {
  const { user_id, symbol, type, entry_price, quantity } = req.body;
  console.log("Received Trade Request:", req.body);

  // VERIFY USER ID MATCHES TOKEN 
  if (req.user.id !== parseInt(user_id)) {
      return res.status(403).json({ error: "Access Denied" });
  }

  try {
 // INSERT INTO PENDING TRANSACTIONS TABLE
    const sql = `INSERT INTO pending_transactions 
                 (user_id, symbol, type, entry_price, quantity, status) 
                 VALUES (?, ?, ?, ?, ?, 'AWAITING AUTHORISATION')`;
    
    await db.query(sql, [user_id, symbol, type, entry_price, quantity]);
    
    await logAction(user_id, 'ORDER_PENDING', `Requested ${type} ${quantity} ${symbol}`);
    
    res.status(201).json({ message: "Trade submitted for authorisation" });
    
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: "Database buffer error" });
  }
});

// GET USER DETAILS FOR TRADE RECEIPT 
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


export default router;