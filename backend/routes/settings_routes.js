import express from 'express';
const router = express.Router();
import db, { logAction } from '../database/database.js';
import bcrypt from 'bcrypt';


// UPDATE PROFILE 
router.put('/update-profile/:id', async (req, res) => {
  const { fullName, email, dob } = req.body;
  const userId = req.params.id;

  try {
    const sql = "UPDATE users SET full_name = ?, email = ?, dob = ? WHERE id = ?";
    await db.query(sql, [fullName, email, dob, userId]);
    
    await logAction(userId, 'PROFILE_UPDATE', `User updated profile metadata`);
    res.json({ message: "Profile updated successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Database error: " + err.message });
  }
});


// CHANGE PASSWORD 
router.put('/change-password/:id', async (req, res) => {
  const { petName, lastFourPhone, currentPassword, newPassword } = req.body;
  const userId = req.params.id;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    
    const user = rows[0];

    const phoneSuffix = user.phone.slice(-4);
    if (user.pet_name.toLowerCase() !== petName.toLowerCase() || phoneSuffix !== lastFourPhone) {
      await logAction(userId, 'SECURITY_FAIL', `Failed security question handshake`);
      return res.status(401).json({ error: "Security verification failed. Details do not match our records." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ error: "Current password incorrect." });

    const hashedNew = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedNew, userId]);

    await logAction(userId, 'PASSWORD_CHANGE', `Password successfully rotated`);
    res.json({ message: "Security credentials updated successfully!" });

  } catch (err) {
    res.status(500).json({ error: "Security update error: " + err.message });
  }
});


// DELETE ACCOUNT
router.delete('/delete-account/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    await logAction(userId, 'ACCOUNT_TERMINATED', `User deleted their account`);
    await db.query("DELETE FROM users WHERE id = ?", [userId]);
    res.json({ message: "Account successfully purged from system." });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed: " + err.message });
  }
});

export default router;