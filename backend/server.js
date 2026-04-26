import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

import loginRoutes from './routes/login_routes.js';
import registerRoutes from './routes/register_routes.js';
import profileRoutes from './routes/profile_routes.js';
import receiptRoutes from './routes/receipt_routes.js';
import adminRoutes from './routes/admin_routes.js';
import settingsRoutes from './routes/settings_routes.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/login', loginRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/receipt', receiptRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/settings', settingsRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`SERVER STARTED: http://localhost:${PORT}`);
});