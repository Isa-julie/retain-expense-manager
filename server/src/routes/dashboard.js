import { Router } from 'express';
import mongoose from 'mongoose';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import { protect } from '../middleware/auth.js';
import { asyncHandler } from '../utils/httpError.js';
import { currentMonth, monthRange } from '../utils/dates.js';

const router = Router();
router.use(protect);

// "approaching" means you have used 80% or more of the budget.
const APPROACHING_AT = 0.8;

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const month = req.query.month || currentMonth();
    const { start, end } = monthRange(month);
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const inMonth = { user: userId, date: { $gte: start, $lt: end } };

    const [totals, highest, byCategory, recent, budget] = await Promise.all([
      Expense.aggregate([{ $match: inMonth }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Expense.findOne(inMonth).sort({ amount: -1 }).populate('category', 'name'),
      Expense.aggregate([
        { $match: inMonth },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'cat' } },
        { $project: { _id: 0, categoryId: '$_id', name: { $ifNull: [{ $first: '$cat.name' }, 'Uncategorized'] }, total: 1, count: 1 } },
        { $sort: { total: -1 } },
      ]),
      Expense.find(inMonth).sort({ date: -1, createdAt: -1 }).limit(5).populate('category', 'name'),
      Budget.findOne({ user: req.user._id, month }),
    ]);

    const spent = totals[0]?.total ?? 0;
    const budgetAmount = budget ? budget.amount : null;
    let status = 'none';
    if (budgetAmount !== null) {
      if (spent > budgetAmount) status = 'over';
      else if (spent >= budgetAmount * APPROACHING_AT) status = 'approaching';
      else status = 'within';
    }

    res.json({
      month,
      totalSpent: spent,
      expenseCount: totals[0]?.count ?? 0,
      budget: budgetAmount,
      remaining: budgetAmount === null ? null : budgetAmount - spent,
      status,
      highestExpense: highest,
      byCategory,
      recent,
    });
  })
);

export default router;
