const Category = require('../../models/Category');
const Policy = require('../../models/Policy');
const Type = require('../../models/Type');

// Receive a map with key as title，values as an object containing {category, site, type, date, title, uri, link}
const insertDB = async data => {
  data = await [...data].map(async policy => {
    let { category, type, title, date, site, uri, link } = policy[1];
    try {
      let thisCategory = await Category.findOne({ category });
      let thisType = await Type.findOne({ type });
      let thisPolicy = await Policy.findOneAndUpdate(
        { link },
        {
          title,
          category_id: thisCategory._id,
          type_id: thisType._id,
          site,
          date,
          site_url: uri,
        },
        { new: true, upsert: true, rawResult: true }
      );
      // thisPolicy expected structure showing below
      /*
      { lastErrorObject:
        { n: 1,
          updatedExisting: false,
          upserted: 5d4... },
          value: { _id: 5d4..., title: xxx .... },
          ok: 1 }
      value: { _id: 5d4..., title: xxx, ... },
      ok: 1,
      ...
        }
      */

      thisCategory.policies.includes(thisPolicy.value._id) ||
        thisCategory.policies.push(thisPolicy.value._id);

      thisType.policies.includes(thisPolicy.value._id) ||
        thisType.policies.push(thisPolicy.value._id);

      await thisCategory.save();
      await thisType.save();

      // Check whether it is a new policy
      if (thisPolicy.lastErrorObject.updatedExisting) {
        //...find all users who subscribe this type of policy
        //...send alert to users
      }

      return thisPolicy.value;
    } catch (error) {
      console.error(error);
    }
  });

  return Promise.all(data);
};

module.exports = insertDB;
