const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  policies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'policies' }],
  types: [{ type: String }],
  added_date: { type: Date, default: Date.now },
});

CategorySchema.pre('deleteMany', async function (next) {
  try {
    let thoseCategories = await mongoose.model('categories').find(this.getFilter()).exec();
    let categories = thoseCategories.map(category => category.category);
    let categoriesId = thoseCategories.map(category => category._id);
    await mongoose
      .model('policies')
      .deleteMany({ category_id: { $in: categoriesId } })
      .exec();
    await mongoose
      .model('types')
      .deleteMany({ category: { $in: categories } })
      .exec();
    await mongoose
      .model('users')
      .updateMany(
        { 'subscriptions.category': { $in: categoriesId } },
        { $pull: { subscriptions: { category: { $in: categoriesId } } } },
        {
          new: true,
        }
      )
      .exec();
    next();
  } catch (error) {
    next(error);
  }
});

// CategorySchema.pre('deleteOne', async function (next) {
//   try {
//     let category = await mongoose.model('categories').findOne(this.getFilter()).exec();
//     category = category.category;
//     const categoryId = this.getQuery()['_id'];
//     await mongoose.model('types').deleteMany({ category }).exec();
//     await mongoose.model('policies').deleteMany({ category_id: categoryId }).exec();
//     await mongoose
//       .model('users')
//       .updateMany(
//         { subscriptions: { category: { $in: [categoriesId] } } },
//         { $pull: { subscriptions: { category: { $in: [categoriesId] } } } }
//       )
//       .exec();
//   } catch (error) {
//     next(error);
//   }
// });

// @ Params : specific type string  | [callback]
// @ Purpose: when a type is deleted, need to call this to delete reference in this doc
CategorySchema.statics.clearTypeRef = function (type, cb) {
  return this.findOneAndUpdate(
    { types: { $in: [type] } },
    { $pull: { types: { $in: [type] } } },
    cb
  );
};

// @ Params : specific policy mongo ObjectId  | [callback]
// @ Purpose: when a policy is deleted, need to call this to delete reference in this doc
CategorySchema.statics.clearPolicyRef = function (policyId, cb) {
  return this.findOneAndUpdate(
    { policies: { $in: [policyId] } },
    { $pull: { policies: { $in: [policyId] } } },
    cb
  );
};

module.exports = mongoose.model('categories', CategorySchema);
