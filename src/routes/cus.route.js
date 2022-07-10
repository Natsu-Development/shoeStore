const express = require('express');
const router = express.Router();
const orderController = require('../app/controllers/orderController');
const passportConfig = require('../app/middlewares/passport.mdw');

// check out 
router.post('/checkout', passportConfig.auth, orderController.checkout);

router.get('/checkoutComplete', passportConfig.auth, (req, res) => {
    res.render('checkoutComplete');
});
router.get('/wishList', passportConfig.auth, (req, res) => {
    res.render('wishList');
});

module.exports = router;