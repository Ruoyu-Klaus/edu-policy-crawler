const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
  category: { type: String, required: true, unique: true },
  policies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'policies' }],
  types: [{ type: mongoose.Schema.Types.ObjectId, ref: 'types' }],
  added_date: { type: Date, default: Date.now },
});

// CategorySchema.statics.findOrCreate = function findOrCreate(data, callback) {
//   var categoryObj = new this();
//   this.findOne({ category: data.category }, function (err, result) {
//     if (!result) {
//       categoryObj.category = data.category;
//       categoryObj.types = data.types;
//       categoryObj.save(callback);
//     } else {
//       callback(err, result);
//     }
//   });
// };
module.exports = mongoose.model('categories', CategorySchema);
