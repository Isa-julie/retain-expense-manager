import { Router } from 'express';
import Budget from '../models/Budget.js';
import { protect } from '../middleware/auth.js';
import { HttpError, asyncHandler } from '../utils/httpError.js';
import { assertMonth, currentMonth } from '../utils/dates.js';

const router = Router();
router.use(protect);

// Get my budget for a month. amount is null when none is set yet.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const month = assertMonth(req.query.month || currentMonth());
    const budget = await Budget.findOne({ user: req.user._id, month });
    res.json({ month, amount: budget ? budget.amount : null });
  })
);

// Set or update my budget for a month (creates it if missing).
router.put(
  '/',
  asyncHandler(async (req, res) => {
    const month = assertMonth(req.body.month);
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) throw new HttpError(400, 'Budget must be more than 0.');

    const budget = await Budget.findOneAndUpdate(
      { user: req.user._id, month },
      { amount },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.json({ month: budget.month, amount: budget.amount });
  })
);

export default router;
