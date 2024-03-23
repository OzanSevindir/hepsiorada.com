const { Sequelize } = require("sequelize");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const pug = require("pug");
const path = require("path");

const sequelize = new Sequelize({
  dialect: "postgres",
  host: "127.0.0.1",
  port: "5432",
  username: "postgres",
  password: "123456",
  database: "hepsi_orada",
  logging: false,
});

const tables = require("./models/init-models.js").initModels(sequelize);

// Set Pug.js as the default template engine
app.set("view engine", "pug");

// Set the directory for Pug templates
app.set("views", path.join(__dirname, "views"));

// Parse JSON bodiesgg
app.use(bodyParser.json());

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals._data = {
    data: null,
    error: null,
    view: null,
  };
  next();
});

app.get("/product", async (req, res, next) => {
  try {
    const products = await tables.t_product.findAll({
      attributes: ["id", "name", "price", "category_id"],
      include: [
        {
          model: tables.t_category,
          as: "category",
          attributes: ["name"],
          required: false,
        },
      ],
    });

    if (products.length > 0) {
      res.locals._data.data = { products };
      res.locals._data.view = { path: "products" };
    } else {
      res.locals._data.error = { code: 404, message: "Products not found!" };
    }
  } catch (error) {
    res.locals._data.error = { code: 500, message: error.message };
  }
  next();
});

app.get("/product/:id(\\d+)", async (req, res, next) => {
  try {
    // req.params.id path ini nasil incelemistik
    const productId = req.params.id;
    const product = await tables.t_product.findOne({
      attributes: ["id", "name", "price", "category_id"],
      include: [
        {
          model: tables.t_category,
          as: "category",
          attributes: ["name"],
          required: false,
        },
      ],
      where: { id: productId },
    });

    if (product) {
      res.locals._data.data = product;
      // res.locals._data.view = { path: "detail" };
    } else {
      // req in calisma biciminde net degilim galiba
      // postman dan request yapilinca app'e ulasan object mi
      // req url deki page isminden sonraki inputu autodirect mi ediyo
      res.locals._data.error = { code: 404, message: "not found!" };
    }
  } catch (error) {
    res.locals._data.error = { code: 500, message: error.message };
  }
  next();
});

app.get("/product/create", async (req, res, next) => {
  res.locals._data.view = { path: "create" };

  // res.render("create");
  next();
});

app.post("/product/create", async (req, res, next) => {
  try {
    const productName = req.body.name;
    const productPrice = req.body.price;
    const productCategory = req.body.category;

    // Find category ID by category name
    const category = await tables.t_category.findOne({
      where: { name: productCategory },
    });

    if (!category) {
      return res.status(400).send("Category not found");
    }

    // Create product using category ID
    // Burasi troll oldu biraz. Pug da value ya id atayip direkt ulasabilirdik
    const createdProduct = await tables.t_product.create({
      name: productName,
      price: productPrice,
      category_id: category.id,
    });

    res.locals._data.data = createdProduct;
    // res.locals._data.view = { path: "detail" };
  } catch (error) {
    res.locals._data.error = { code: 500, message: error.message };
  }
  next();
});

app.put("/product/:id", async (req, res, next) => {
  try {
    const productId = req.params.id;
    const productName = req.body.name;
    const productPrice = req.body.price;
    const categoryId = req.body.category_id;
    await tables.t_product.update(
      {
        name: productName,
        price: productPrice,
        category_id: categoryId,
      },
      { where: { id: productId } }
    );

    const updatedProduct = await tables.t_product.findOne({
      attributes: ["id", "name", "price", "category_id"],
      where: { id: productId },
    });
    res.locals._data.data = updatedProduct;
  } catch (error) {
    res.locals._data.error = { code: 500, message: error.message };
  }
  next();
});

app.delete("/product/:id", async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await tables.t_category.destroy({
      where: { id: productId },
    });
  } catch (error) {
    res.locals._data.error = { code: 500, message: error.message };
  }
  next();
});

// app.get("*", async (req, res, next) => {
//   res.locals._data.view = { path: "notFound" };
//   next();
// });

app.use((req, res) => {
  if (res.locals._data.error) {
    res
      .status(res.locals._data.error.code)
      .send(res.locals._data.error.message);
  } else {
    if (res.locals._data.view) {
      res.render(res.locals._data.view.path, res.locals._data.data);
    } else {
      res.send(res.locals._data.data);
    }
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
