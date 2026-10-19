import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    // The one special category that receives expenses when another category is deleted.
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// "Food" and "food" count as the same name.
categorySchema.index({ name: 1 }, { unique: true, collation: { locale: 'en', strength: 2 } });

const Category = mongoose.model('Category', categorySchema);
export default Category;

const STARTERS = ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Entertainment', 'Education'];

// Runs on every server start. Makes sure "Uncategorized" exists, and adds
// starter categories the very first time so new users have something to pick.
export async function ensureDefaultCategory() {
  let fallback = await Category.findOne({ isDefault: true });
  if (!fallback) {
    const total = await Category.countDocuments();
    fallback = await Category.create({ name: 'Uncategorized', isDefault: true });
    if (total === 0) {
      await Category.insertMany(STARTERS.map((name) => ({ name })));
    }
  }
  return fallback;
}
