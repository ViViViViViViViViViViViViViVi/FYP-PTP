import express from 'express';
const router = express.Router();
import db, { logAction } from '../database/database.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const secretKey = 'your_super_secret_key';


// LOGIN ROUTE - VERIFY USER AGAINST DATABASE
router.post('/', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const sql = "SELECT id, full_name, email, password, balance, total_wins, is_admin FROM users WHERE email = ?";
    const [rows] = await db.query(sql, [email]);
    
    if (rows.length > 0) {
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      // IF PASSWORD MATCHES, GENERATE JWT TOKEN AND RETURN USER DATA

      if (isMatch) {
        const token = jwt.sign(
          { id: user.id, email: user.email, is_admin: user.is_admin }, 
          secretKey, 
          { expiresIn: '1h' } 
        );

        delete user.password; 
        await logAction(user.id, 'LOGIN', `${user.full_name} signed in successfully`);
        
        res.json({ 
          message: "Login successful!", 
          user, 
          token 
        }); 
      } else {
        await logAction(null, 'LOGIN_FAILED', `Failed attempt for email: ${email}`);
        res.status(401).json({ error: "Invalid email or password" });
      }
    } else {
      await logAction(null, 'LOGIN_FAILED', `Email not found: ${email}`);
      res.status(401).json({ error: "Invalid email or password" });
    }
  } catch (err) { 
    res.status(500).json({ error: "Database error: " + err.message }); 
  }
});


// GET USER ID FROM EMAIL (FOR PASSWORD RESET ETC)
router.get('/return-id-by-email/:email', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [req.params.email]);
    if (rows.length > 0)
      res.json({ id: rows[0].id });
    else {
      await logAction(null, 'EMAIL_QUERY_FAIL', `Email not found: ${req.params.email}`);
      res.json({ error: "User email not found" });
    }
  } catch (err) { res.json({ error: err.message }); }
});


export default router;