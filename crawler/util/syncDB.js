const targetSites = require('../src/targetSites.json');

const moment = require('moment');

const Category = require('../../models/Category');
const Type = require('../../models/Type');
const Policy = require('../../models/Policy');

const createCategoryArray = targetSites => {
  var categories = new Set([...targetSites.map(i => i['category'])]);
  let category_array = Array.from(categories);
  return category_array;
};

const createTypeArray = targetSites => {
  let type_array = new Array();
  var types = new Set([...targetSites.map(i => i['type'])]);
  [...types].forEach(i => type_array.push({ type: i, category: null }));

  for (const i of type_array) {
    for (const t of targetSites) {
      t['type'] === i['type'] && (i.category = t.category);
    }
  }
  return type_array;
};

const category_array = createCategoryArray(targetSites);
const type_array = createTypeArray(targetSites);

const syncDB = () => {
  return new Promise((resolve, reject) => {
    let updateType = type_array.map(i => {
      const { type, category } = i;
      return Type.findOneAndUpdate({ type }, { category }, { new: true, upsert: true }).exec();
    });
    Promise.all(updateType).then(allTypes => {
      let updateCategory = category_array.map(category => {
        let types = allTypes.filter(type => type.category === category);
        return Category.findOneAndUpdate(
          { category },
          { types },
          { new: true, upsert: true }
        ).exec();
      });
      // Remove outdated policies from database
      Promise.all(updateCategory)
        .then(async allCategory => {
          const outdatedPolicies = await Policy.find({
            date: {
              $lte: moment().subtract(90, 'days'),
            },
          }).exec();
          const outdatedPoliciesId = outdatedPolicies.map(i => i._id);
          let deletePolicies = outdatedPoliciesId.map(id => {
            return Policy.deleteOne({ id }).exec();
          });
          Promise.all(deletePolicies)
            .then(_ => resolve(allCategory))
            .catch(error => reject(error));
        })
        .catch(error => {
          reject(error);
        });
    });
  });
};
module.exports = syncDB;
