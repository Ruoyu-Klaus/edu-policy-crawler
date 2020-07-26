const mongoose = require('mongoose');
const { model } = require('./Category');

const PolicySchema = new mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
  type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'types' },
  title: { type: String, required: true },
  link: { type: String },
  site: { type: String, required: true },
  site_url: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

PolicySchema.pre('deleteOne', async function (next) {
  try {
    const policyId = this.getQuery()['_id'];
    await mongoose.model('categories').clearPolicyRef(policyId).exec();
    await mongoose.model('types').clearPolicyRef(policyId).exec();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('policies', PolicySchema);
