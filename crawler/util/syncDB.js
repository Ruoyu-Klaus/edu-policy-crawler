const targetSites = require('../src/targetSites.json');

const Category = require('../../models/Category');
const Type = require('../../models/Type');
// const Policy = require('../../models/Policy');

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

module.exports = async () => {
  try {
    await (() => {
      let updateType = type_array.map(type => {
        return Type.findOneAndUpdate(
          { type: type.type },
          { category: type.category },
          { new: true, upsert: true }
        );
      });
      return Promise.resolve(updateType);
    })();

    let updateCategory = category_array.map(async category => {
      let thisCategoryTypes = await Type.find({ category: category.category });
      let typesArray = thisCategoryTypes.map(type => {
        return type._id;
      });
      return Category.findOneAndUpdate(
        { category: category.category },
        { types: typesArray },
        { new: true, upsert: true }
      );
    });
    // if necessary, remove policies which are more than a month ago

    return Promise.resolve(updateCategory);
  } catch (error) {
    console.warn(error);
  }
};
