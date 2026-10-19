import { Router } from 'express';
import mongoose from 'mongoose';
import Expense, { PAYMENT_METHODS } from '../models/Expense.js';
import Category, { ensureDefaultCategory } from '../models/Category.js';
import { protect } from '../middleware/auth.js';
import { HttpError, asyncHandler } from '../utils/httpError.js';

const router = Router();
router.use(protect); // every route below needs a signed-in user

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Checks the body and returns clean values, or throws a 400 with a clear message.
async function readExpenseBody(body) {
  const title = String(body.title || '').trim();
  const amount = Number(body.amount);
  const date = new Date(body.date);
  const paymentMethod = String(body.paymentMethod || '');
  const notes = String(body.notes || '').trim();

  if (!title) throw new HttpError(400, 'Title is required.');
  if (!Number.isFinite(amount) || amount <= 0) throw new HttpError(400, 'Amount must be more than 0.');
  if (Number.isNaN(date.getTime())) throw new HttpError(400, 'Please choose a valid date.');
  if (!PAYMENT_METHODS.includes(paymentMethod)) throw new HttpError(400, 'Please choose a payment method.');
  if (notes.length > 500) throw new HttpError(400, 'Notes must be 500 characters or fewer.');

  let category = body.category;
  if (!category) {
    category = (await ensureDefaultCategory())._id;
  } else if (!mongoose.isValidObjectId(category) || !(await Category.exists({ _id: category }))) {
    throw new HttpError(400, 'That category does not exist.');
  }

  return { title, amount, date, paymentMethod, notes, category };
}

// List with search, filters, sorting and pagination.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { q, category, paymentMethod, from, to, minAmount, maxAmount } = req.query;
    const sortBy = req.query.sortBy === 'amount' ? 'amount' : 'date';
    const order = req.query.order === 'asc' ? 1 : -1;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

    // Always start with "only my expenses".
    const filter = { user: req.user._id };

    if (q) {
      const rx = new RegExp(escapeRegex(String(q).trim()), 'i');
      filter.$or = [{ title: rx }, { notes: rx }];
    }
    if (category) {
      if (!mongoose.isValidObjectId(category)) throw new HttpError(400, 'Invalid category.');
      filter.category = category;
    }
    if (paymentMethod) {
      if (!PAYMENT_METHODS.includes(paymentMethod)) throw new HttpError(400, 'Invalid payment method.');
      filter.paymentMethod = paymentMethod;
    }
    if (from || to) {
      filter.date = {};
      if (from) {
        const d = new Date(`${from}T00:00:00.000Z`);
        if (Number.isNaN(d.getTime())) throw new HttpError(400, 'Invalid "from" date.');
        filter.date.$gte = d;
      }
      if (to) {
        const d = new Date(`${to}T23:59:59.999Z`);
        if (Number.isNaN(d.getTime())) throw new HttpError(400, 'Invalid "to" date.');
        filter.date.$lte = d;
      }
    }
    if (minAmount || maxAmount) {
      filter.amount = {};
      if (minAmount) filter.amount.$gte = Number(minAmount);
      if (maxAmount) filter.amount.$lte = Number(maxAmount);
    }

    const [items, total] = await Promise.all([
      Expense.find(filter)
        .sort({ [sortBy]: order, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('category', 'name isDefault'),
      Expense.countDocuments(filter),
    ]);

    res.json({ items, total, page, pages: Math.max(Math.ceil(total / limit), 1) });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    // Matching on user too means nobody can open someone else's expense by guessing an id.
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user._id }).populate(
      'category',
      'name isDefault'
    );
    if (!expense) throw new HttpError(404, 'Expense not found.');
    res.json(expense);
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = await readExpenseBody(req.body);
    const expense = await Expense.create({ ...data, user: req.user._id });
    await expense.populate('category', 'name isDefault');
    res.status(201).json(expense);
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = await readExpenseBody(req.body);
    const expense = await Expense.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, data, {
      new: true,
      runValidators: true,
    }).populate('category', 'name isDefault');
    if (!expense) throw new HttpError(404, 'Expense not found.');
    res.json(expense);
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) throw new HttpError(404, 'Expense not found.');
    res.json({ message: 'Expense deleted.' });
  })
);

export default router;
