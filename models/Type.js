const mongoose = require('mongoose');

const TypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  policies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'policies' }],
  added_date: { type: Date, default: Date.now },
});

// @ Params : specific policy mongo ObjectId  | [callback]
// @ Purpose: when a policy is deleted, need to call this to delete reference in this doc
TypeSchema.statics.clearPolicyRef = function (policyId, cb) {
  return this.findOneAndUpdate(
    { policies: { $in: [policyId] } },
    { $pull: { policies: { $in: [policyId] } } },
    cb
  );
};

module.exports = mongoose.model('types', TypeSchema);
