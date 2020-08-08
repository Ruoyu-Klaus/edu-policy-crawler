const mongoose = require('mongoose');

const TypeSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  policies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'policies' }],
  added_date: { type: Date, default: Date.now },
});

// @ Purpose:
// @ delete references with types

TypeSchema.pre('deleteMany', async function (next) {
  try {
    let types = await mongoose.model('types').find(this.getFilter()).exec();
    types = types.map(type => type.type);
    const typesId = this.getFilter()['_id']['$in'];
    await mongoose
      .model('policies')
      .deleteMany({ type_id: { $in: typesId } })
      .exec();
    await mongoose
      .model('categories')
      .updateMany({ types: { $in: types } }, { $pull: { types: { $in: types } } })
      .exec();
    await mongoose
      .model('users')
      .updateMany({ types: { $in: typesId } }, { $pull: { types: { $in: typesId } } })
      .exec();
    // next();
  } catch (error) {
    next(error);
  }
});

// @ Purpose:
// @ delete references with types

TypeSchema.pre('deleteOne', async function (next) {
  try {
    let type = await mongoose.model('types').findOne(this.getFilter()).exec();
    type = type.type;
    const typeId = this.getQuery()['_id'];
    await mongoose.model('categories').clearTypeRef(type).exec();
    await mongoose.model('policies').deleteMany({ type_id: typeId }).exec();
    await mongoose
      .model('users')
      .updateMany({ types: { $in: [typeId] } }, { $pull: { types: { $in: [typeId] } } });
    next();
  } catch (error) {
    next(error);
  }
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
