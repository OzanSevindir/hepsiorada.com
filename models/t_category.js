const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('t_category', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 't_category',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "pk_category_id",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
