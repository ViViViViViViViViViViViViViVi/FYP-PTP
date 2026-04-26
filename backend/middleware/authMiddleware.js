import jwt from 'jsonwebtoken';
import db, { logAction } from '../database/database.js';


// VERIFY JWT TOKEN BEFORE ALLOWING ACCESS TO PROTECTED ROUTES
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  const secretKey = 'your_super_secret_key';

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user; 
    next(); 
  });
};

export default authenticateToken;