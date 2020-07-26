const mongoose = require('mongoose');

const TypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  policies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'policies' }],
  added_date: { type: Date, default: Date.now },
});

TypeSchema.statics.clearPolicyRef = function (policyId) {
  return this.findOneAndUpdate(
    { policies: { $in: [policyId] } },
    { $pull: { policies: { $in: [policyId] } } }
  );
};

module.exports = mongoose.model('types', TypeSchema);
