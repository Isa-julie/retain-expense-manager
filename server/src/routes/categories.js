import { Router } from 'express';
import Category, { ensureDefaultCategory } from '../models/Category.js';
import Expense from '../models/Expense.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { HttpError, asyncHandler } from '../utils/httpError.js';

const router = Router();
router.use(protect);

function cleanName(body) {
  const name = String(body.name || '').trim();
  if (!name) throw new HttpError(400, 'Category name is required.');
  if (name.length > 40) throw new HttpError(400, 'Category name must be 40 characters or fewer.');
  return name;
}

// Any signed-in user can read the list (they need it for the expense form).
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ isDefault: 1, name: 1 }).collation({ locale: 'en' });
    res.json(categories);
  })
);

// Everything below is admin only.
router.post(
  '/',
  adminOnly,
  asyncHandler(async (req, res) => {
    const category = await Category.create({ name: cleanName(req.body) });
    res.status(201).json(category);
  })
);

router.put(
  '/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new HttpError(404, 'Category not found.');
    if (category.isDefault) throw new HttpError(400, 'The default category cannot be renamed.');
    category.name = cleanName(req.body);
    await category.save();
    res.json(category);
  })
);

// Deleting a category moves its expenses to "Uncategorized" so nothing is lost.
router.delete(
  '/:id',
  adminOnly,
  asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) throw new HttpError(404, 'Category not found.');
    if (category.isDefault) throw new HttpError(400, 'The default category cannot be deleted.');

    const fallback = await ensureDefaultCategory();
    const moved = await Expense.updateMany({ category: category._id }, { category: fallback._id });
    await category.deleteOne();
    res.json({ message: 'Category deleted.', movedExpenses: moved.modifiedCount });
  })
);

export default router;
