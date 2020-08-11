const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
  type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'types' },
  title: { type: String, required: true },
  link: { type: String, required: true, unique: true },
  site: { type: String, required: true },
  site_url: { type: String, required: true },
  date: { type: Date, required: true, default: Date.now },
});

// @ Purpose:
// @ delete references with policies

PolicySchema.pre('deleteMany', async function (next) {
  try {
    let policies = await mongoose.model('policies').find(this.getFilter()).exec();
    let policiesId = policies.map(policy => policy._id);
    await mongoose
      .model('categories')
      .updateMany({ policies: { $in: policiesId } }, { $pull: { policies: { $in: policiesId } } })
      .exec();
    await mongoose
      .model('types')
      .updateMany({ policies: { $in: policiesId } }, { $pull: { policies: { $in: policiesId } } })
      .exec();
    next();
  } catch (error) {
    next(error);
  }
});

// @ Purpose:
// @ delete references with policies

// PolicySchema.pre('deleteOne', async function (next) {
//   try {
//     const policyId = this.getQuery()['_id'];
//     await mongoose.model('categories').clearPolicyRef(policyId).exec();
//     await mongoose.model('types').clearPolicyRef(policyId).exec();
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

module.exports = mongoose.model('policies', PolicySchema);
