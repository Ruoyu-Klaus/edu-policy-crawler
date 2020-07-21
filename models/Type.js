const mongoose = require('mongoose');

const TypeSchema = mongoose.Schema({
  type: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  policies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'policies' }],
  added_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('types', TypeSchema);
