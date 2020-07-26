const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  category: { type: String, required: true, unique: true },
  policies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'policies' }],
  types: [{ type: mongoose.Schema.Types.ObjectId, ref: 'types' }],
  added_date: { type: Date, default: Date.now },
});

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
