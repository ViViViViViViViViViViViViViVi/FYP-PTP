import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// --- THE IMPORTS ---
import loginRoutes from './routes/login_routes.js';
import registerRoutes from './routes/register_routes.js';
import profileRoutes from './routes/profile_routes.js';
import receiptRoutes from './routes/receipt_routes.js';
import adminRoutes from './routes/admin_routes.js';
import settingsRoutes from './routes/settings_routes.js';

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(bodyParser.json());

// --- THE PLUG-INS (ROUTING) ---
// We prefix everything with /api so the frontend knows it's talking to the data layer.
app.use('/api/login', loginRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

/* ============================================================
   SECTION 4: SERVER BOOT
   ============================================================ */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`SERVER STARTED: http://localhost:${PORT}`);
});