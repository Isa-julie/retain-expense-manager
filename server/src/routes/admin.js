import { Router } from 'express';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Category from '../models/Category.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { asyncHandler } from '../utils/httpError.js';
import { currentMonth, monthRange } from '../utils/dates.js';

const router = Router();
router.use(protect, adminOnly); // every route here: signed in AND admin

router.get(
  '/insights',
  asyncHandler(async (req, res) => {
    const { start, end } = monthRange(currentMonth());

    const [totalUsers, totalExpenses, valueAgg, monthExpenses, perCategoryAgg, categories, recentExpenses, recentUsers] =
      await Promise.all([
        User.countDocuments(),
        Expense.countDocuments(),
        Expense.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
        Expense.countDocuments({ date: { $gte: start, $lt: end } }),
        Expense.aggregate([{ $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
        Category.find().sort({ name: 1 }),
        Expense.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email').populate('category', 'name'),
        User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      ]);

    // Include categories that have no expenses yet (they count as 0), so "least used" is honest.
    const stats = new Map(perCategoryAgg.map((r) => [String(r._id), r]));
    const perCategory = categories.map((c) => ({
      id: c._id,
      name: c.name,
      total: stats.get(String(c._id))?.total ?? 0,
      count: stats.get(String(c._id))?.count ?? 0,
    }));

    const byUsage = [...perCategory].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
    const leastFirst = [...perCategory].sort((a, b) => a.count - b.count || a.name.localeCompare(b.name));

    res.json({
      totalUsers,
      totalExpenses,
      totalValue: valueAgg[0]?.total ?? 0,
      expensesThisMonth: monthExpenses,
      spendingPerCategory: [...perCategory].sort((a, b) => b.total - a.total),
      topCategories: byUsage.slice(0, 5),
      bottomCategories: leastFirst.slice(0, 5),
      recentExpenses,
      recentUsers,
    });
  })
);

export default router;
