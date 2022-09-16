const express = require("express");
const router = express.Router();
const shoeController = require("../app/controllers/shoeController");

// display shoes by gender
router.get("/shoeByGender", shoeController.displayShoeByGender);

// display all shoes
router.get("/displayAllProducts", shoeController.displayAllProduct);

// filter product
router.post("/shoeByGender", shoeController.displayShoeByGender);

// display shoes by id
router.get("/:id", shoeController.productDetail);

//exports
module.exports = router;
