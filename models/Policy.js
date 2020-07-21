const mongoose = require('mongoose');

const PolicySchema = mongoose.Schema({
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
  type_id: { type: mongoose.Schema.Types.ObjectId, ref: 'types' },
  title: { type: String, required: true },
  link: { type: String },
  site: { type: String, required: true },
  site_url: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('policies', PolicySchema);
