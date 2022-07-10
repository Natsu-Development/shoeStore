const express = require('express');
const router = express.Router();
const cateController = require('../app/controllers/cateController');
const shoeController = require('../app/controllers/shoeController');
const accountController = require('../app/controllers/accountController');
const orderController = require('../app/controllers/orderController');

const passportConfig = require('../app/middlewares/passport.mdw');

// //ACCOUNT
// router.get('/adminLogin', accountController.adminLogin);
// router.post('/account/handleAdminLogin', accountController.handleAdminLogin);
// router.get('/account/renewAccessToken', accountController.renewAccessToken);

// CATEGORY // custom with middlewares
router.get('/category', cateController.manager);
router.get('/category/add', cateController.create);
router.post('/category/save', cateController.saveCreate);
router.get('/category/update/:id', cateController.update);
router.put('/category/saveUpdate/:id', cateController.saveUpdate);
router.delete('/category/delete/:id', cateController.delete);
router.get('/category/:slug', cateController.findCategoryByName);

//PRODUCT
router.get('/product', shoeController.manager);
router.get('/product/add', shoeController.create);
router.post('/product/save', shoeController.saveCreate);
router.get('/product/update/:id', shoeController.update);
router.put('/product/saveUpdate/:id', shoeController.saveUpdate);
router.delete('/product/delete/:id', shoeController.delete);
// router.get('/category/:slug', shoeController.findShoeByName);

//ORDER AND ORDERDETAILS
router.get('/order', orderController.manager);
router.get('/orderNotConfirm', orderController.orderNotConfirm);
router.get('/order/add', orderController.create);
router.post('/order/save', orderController.saveCreate);
router.get('/order/orderDetails/:id', orderController.viewOrderDetails);
router.get('/order/orderUpdate/:id', orderController.orderUpdate);
router.put('/order/orderConfirm/:id', orderController.orderConfirm);
router.put('/order/saveUpdate/:id', orderController.saveUpdate);

//dashboard
router.get('/', (req, res) => {
    res.render('adminPages/', {layout: 'adminLayout'});
});

module.exports = router;