import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { ensureDefaultCategory } from './models/Category.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import budgetRoutes from './routes/budgets.js';
import categoryRoutes from './routes/categories.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing. Add it to server/.env');

const app = express();
const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map((s) => s.trim());

app.use(cors({ origin: allowed }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
await connectDB();
await ensureDefaultCategory();
app.listen(port, () => console.log(`Retain API running on port ${port}`));
