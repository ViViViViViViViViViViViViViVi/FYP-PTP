import jwt from 'jsonwebtoken';
import db, { logAction } from '../database/database.js';


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token

  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token." });
    req.user = user; // Save user data from the token into the request
    next(); // Move to the next function (your database query)
  });
};

export default authenticateToken;