const express = require('express');
const router = express.Router();

// get controller to display shoes in index
const Product = require('../app/controllers/shoeController');

// cart 
router.get('/cart', (req, res) => {
    res.render('cart');
});
// about 
router.get('/about', (req, res) => {
    res.render('about');
});
// contact 
// display the location of store in google map (not done)
router.get('/contact', (req, res) => {
    res.render('contact');
});

//search product
router.post('/', Product.displayAllProduct);

// home
router.get('/', Product.displayAllProduct);


module.exports = router;