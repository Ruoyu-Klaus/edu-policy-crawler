const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  policies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'policies' }],
  types: [{ type: mongoose.Schema.Types.ObjectId, ref: 'types' }],
  added_date: { type: Date, default: Date.now },
});

CategorySchema.statics.clearPolicyRef = function (policyId) {
  return this.findOneAndUpdate(
    { policies: { $in: [policyId] } },
    { $pull: { policies: { $in: [policyId] } } }
  );
};

module.exports = mongoose.model('categories', CategorySchema);
