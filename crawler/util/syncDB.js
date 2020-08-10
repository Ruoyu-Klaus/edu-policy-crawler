const targetSites = require('../src/targetSites.json');
const moment = require('moment');

const Category = require('../../models/Category');
const Type = require('../../models/Type');
const Policy = require('../../models/Policy');
const User = require('../../models/User');

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
  const removeCategorys = async () => {
    try {
      let allCategorys = await Category.find({}, 'category');
      let removeCategorysArr = allCategorys
        .filter(category => !category_array.includes(category.category))
        .map(category => category._id);
      // let removeCategorysArrText = allCategorys
      //   .filter(category => !category_array.includes(category.category))
      //   .map(category => category.category);
      if (Boolean(removeCategorysArr.length)) {
        await Category.deleteMany({ _id: { $in: removeCategorysArr } }).exec();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const removeTypes = () => {
    return new Promise(async (resolve, reject) => {
      try {
        let allTypes = await Type.find({});
        let types = Array.from(new Set([...targetSites.map(i => i['type'])]));
        let removeTypesArr = allTypes
          .filter(type => !types.includes(type.type))
          .map(type => type._id);
        // let removeTypesArrText = allTypes
        //   .filter(type => !types.includes(type.type))
        //   .map(type => type.type);

        if (Boolean(removeTypesArr.length)) {
          await Type.deleteMany({ _id: { $in: removeTypesArr } }).exec();
        }
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };

  const updateTypeAndCategory = async () => {
    try {
      // let allTypes = await Type.find({});
      // let types = Array.from(new Set([...targetSites.map(i => i['type'])]));
      // let updateTypesArr = types
      //   .filter(type => !allTypes.includes(type))
      //   .map(type => type.type);
      const updateType = await Type.bulkWrite(
        type_array.map(i => ({
          updateOne: {
            filter: { type: i.type },
            update: { category: i.category },
            upsert: true,
            new: true,
          },
        }))
      );
      let categoryArr = category_array.map(category => {
        var types = type_array.filter(i => i.category === category).map(i => i.type);
        return { category, types };
      });
      const updateCategory = await Category.bulkWrite(
        categoryArr.map(i => ({
          updateOne: {
            filter: { category: i.category },
            update: { types: i.types },
            upsert: true,
          },
        }))
      );
    } catch (error) {
      console.log(error);
    }
  };

  const removeOutdatedPolicies = async () => {
    const outdatedPolicies = await Policy.find({
      date: {
        $lte: moment().subtract(60, 'days'),
      },
    }).exec();
    const outdatedPoliciesId = outdatedPolicies.map(i => i._id);
    await Policy.deleteMany({ _id: { $in: outdatedPoliciesId } });
    return outdatedPoliciesId;
  };
  const main = async () => {
    await removeCategorys();
    await removeTypes();
    await removeOutdatedPolicies();
    await updateTypeAndCategory();
    return;
  };
  return main();
};
module.exports = syncDB;
