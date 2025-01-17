const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  subscriptions: [
    {
      require: false,
      category: { type: mongoose.Schema.Types.ObjectId, ref: 'categories' },
      types: [{ type: mongoose.Schema.Types.ObjectId, ref: 'types' }],
    },
  ],
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('users', UserSchema);
