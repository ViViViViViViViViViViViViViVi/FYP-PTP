import express from 'express';                            
const router = express.Router();
import db, { logAction } from '../database/database.js';
import bcrypt from 'bcrypt'; // <--- Added this to handle the secure password check
import jwt from 'jsonwebtoken';
const secretKey = 'your_super_secret_key';
// ======================================================================================================================== //

//============================================================ //
// USER & AUTHENTICATION ROUTES //
//============================================================ //

// ======================================================================================================================== //

// THE LOGIN IN ROUTE - VERIFICATION AGAINST DATABASE

router.post('/', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const sql = "SELECT id, full_name, email, password, balance, total_wins, is_admin FROM users WHERE email = ?";
    const [rows] = await db.query(sql, [email]);
    
    if (rows.length > 0) {
      const user = rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        // 1. Generate the JWT Token (The 'Digital Passport')
        const token = jwt.sign(
          { id: user.id, email: user.email, is_admin: user.is_admin }, 
          secretKey, 
          { expiresIn: '1h' } // Token expires in 1 hour for security
        );

        // 2. Remove password from the object for safety
        delete user.password; 

        await logAction(user.id, 'LOGIN', `${user.full_name} signed in successfully`);
        
        // 3. Return the token along with the user data
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
// ======================================================================================================================== //

// EMAIL TO ID ROUTE - FOR PAGES THAT REQUIRE USER ID BUT ONLY HAVE EMAIL [FUTURE USE CASES : PASSWORD RESET]

router.get('/return-id-by-email/:email', async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id FROM users WHERE email = ?", [req.params.email]);            // <--- Takes user email from Specific Page and checks database for matching user
    if (rows.length > 0)                                                                                  // <--- If a match is found - row is bigger then 0
      res.json({ id: rows[0].id });                                                                       // <--- Returns the specific user's ID to the Specific Page
    else {
      await logAction(null, 'EMAIL_QUERY_FAIL', `Email not found: ${req.params.email}`);                  // <--- notification for admin
      res.json({ error: "User email not found" });                                                        // <--- notification for react
    }
  } catch (err) { res.json({ error: err.message }); }                                                     // <--- notification for react [Other Errors]
});

// ======================================================================================================================== //


export default router;