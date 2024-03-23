var DataTypes = require("sequelize").DataTypes;
var _t_category = require("./t_category");
var _t_product = require("./t_product");

function initModels(sequelize) {
  var t_category = _t_category(sequelize, DataTypes);
  var t_product = _t_product(sequelize, DataTypes);

  t_product.belongsTo(t_category, { as: "category", foreignKey: "category_id"});
  t_category.hasMany(t_product, { as: "t_products", foreignKey: "category_id"});

  return {
    t_category,
    t_product,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
