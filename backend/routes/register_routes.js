import express from 'express';
import db from '../database/database.js';
import bcrypt from 'bcrypt';

const router = express.Router();


// CREATE NEW USER ACCOUNT (SIGNUP)
router.post('/', async (req, res) => {
  const { 
    firstName, lastName, email, phone, 
    password, securityQuestion, securityAnswer, tradingKnowledge 
  } = req.body;

  try {
    const fullName = `${firstName} ${lastName}`;
    const securityFull = `${securityQuestion}: ${securityAnswer}`;
    const hashedPassword = await bcrypt.hash(password, 12);  // Hash the password with a salt round of 12
    const sql = `
      INSERT INTO users 
      (full_name, email, phone, password, security_question, trading_knowledge, dob, balance, initial_balance, is_admin) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await db.execute(sql, [
      fullName, 
      email, 
      phone, 
      hashedPassword, 
      securityFull, 
      tradingKnowledge, 
      '2001-01-01', 
      1000.00,      
      1000.00,      
      0             
    ]);

    console.log(`DATABASE SUCCESS: Account created for ${email}`);
    res.status(201).json({ message: "Account successfully created!" });

  } catch (err) {
    console.error("SQL SCHEMA ERROR:", err.message);
    res.status(500).json({ error: "Database mapping failure" });
  }
});

export default router;