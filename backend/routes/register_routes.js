import express from 'express';
import db from '../database/database.js';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/', async (req, res) => {
  const { 
    firstName, lastName, email, phone, 
    password, securityQuestion, securityAnswer, tradingKnowledge 
  } = req.body;

  try {
    // 1. DATA CONCATENATION: Match your 'full_name' and 'security_question' columns
    const fullName = `${firstName} ${lastName}`;
    const securityFull = `${securityQuestion}: ${securityAnswer}`;

    // 2. PASSWORD SECURITY: Scramble the password before it hits the DB
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. TARGETED SQL: These column names now match your MySQL Workbench exactly
    const sql = `
      INSERT INTO users 
      (full_name, email, phone, password, security_question, trading_knowledge, dob, balance, initial_balance, is_admin) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    // 4. DATA MAPPING: Providing defaults for DOB and Balance to prevent SQL errors
    await db.execute(sql, [
      fullName, 
      email, 
      phone, 
      hashedPassword, 
      securityFull, 
      tradingKnowledge, 
      '2000-01-01', // Placeholder DOB
      1000.00,      // Starting Balance
      1000.00,      // Initial Balance Reference
      0             // is_admin (0 = No)
    ]);

    console.log(`DATABASE SUCCESS: Account created for ${email}`);
    res.status(201).json({ message: "Account successfully created!" });

  } catch (err) {
    console.error("SQL SCHEMA ERROR:", err.message);
    res.status(500).json({ error: "Database mapping failure. Check column names." });
  }
});

export default router;