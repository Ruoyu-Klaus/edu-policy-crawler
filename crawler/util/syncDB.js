const targetSites = require('../src/targetSites.json');
const moment = require('moment');

const Category = require('../../models/Category');
const Type = require('../../models/Type');
const Policy = require('../../models/Policy');
const User = require('../../models/User');

// Extract a list name of category from data source
const createCategoryArray = targetSites => {
  var categories = new Set([...targetSites.map(i => i['category'])]);
  let category_array = Array.from(categories);
  return category_array;
};

// Extract a list name of type with category from data source
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
  const removeAndUpdateCategories = async () => {
    try {
      let allCategorys = await Category.find({});
      let removeCategoriesArr = allCategorys
        .filter(category => !category_array.includes(category.category))
        .map(category => category._id);
      if (Boolean(removeCategoriesArr.length)) {
        await Category.deleteMany({ _id: { $in: removeCategoriesArr } }).exec();
      }

      let updateCategoriesArr = category_array.map(category => {
        var types = type_array.filter(i => i.category === category).map(i => i.type);
        return { category, types };
      });
      let updateCategory = await Category.bulkWrite(
        updateCategoriesArr.map(i => ({
          updateOne: {
            filter: { category: i.category },
            update: { types: i.types },
            upsert: true,
          },
        }))
      );
      return Promise.resolve(updateCategory);
    } catch (error) {
      Promise.reject(error);
    }
  };
  const removeAndUpdateTypes = async () => {
    try {
      let allTypes = await Type.find({});
      let removeTypesArr = [];
      allTypes.forEach(i => {
        let theseTypes = type_array.map(t => {
          if (t.type === i.type && t.category !== i.category) {
            removeTypesArr.push(i._id);
          }
          return t.type;
        });
        if (!theseTypes.includes(i.type)) {
          removeTypesArr.push(i._id);
        }
      });

      if (Boolean(removeTypesArr.length)) {
        await Type.deleteMany({ _id: { $in: removeTypesArr } }).exec();
      }
      let updateType = await Type.bulkWrite(
        type_array.map(i => ({
          updateOne: {
            filter: { type: i.type },
            update: { category: i.category },
            upsert: true,
            new: true,
          },
        }))
      );
      return Promise.resolve(updateType);
    } catch (error) {
      return Promise.reject(error);
    }
  };

  const removeOutdatedPolicies = async () => {
    const outdatedPolicies = await Policy.find({
      date: {
        $lte: moment().subtract(90, 'days'),
      },
    }).exec();

    const outdatedPoliciesId = outdatedPolicies.map(i => i._id);
    await Policy.deleteMany({ _id: { $in: outdatedPoliciesId } });
    return outdatedPoliciesId;
  };
  const main = async () => {
    try {
      await removeAndUpdateCategories();
      await removeAndUpdateTypes();
      await removeOutdatedPolicies();
    } catch (error) {
      console.log(error);
    }
  };
  return main();
};
module.exports = syncDB;
