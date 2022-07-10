const express = require('express');
const router = express.Router();
const accountController = require('../app/controllers/accountController');
const accountHelp = require('../utils/accountHelp');

// import passport
const passport = require('passport');
const passportConfig = require('../app/middlewares/passport.mdw.js');
const jwtHelp = require('../utils/jwtHelp');

//Login by google   
router.get('/auth/google', passport.authenticate('google', {session: false}));

router.get('/google/callback', passport.authenticate('google', {
    session: false,
    failureRedirect: '/',
}), accountController.encodeAndStoreToken);

//Login by facebook   
router.get('/auth/facebook', passport.authenticate('facebook', {session: false}));
router.get('/facebook/callback', passport.authenticate('facebook', {
    session: false,
    failureRedirect: '/',
}), accountController.encodeAndStoreToken);

// route for test authenticate 
router.get('/testAuth', passportConfig.auth, accountController.testAuth);

// ADMIN LOGIN
router.get('/adminLogin', accountController.adminLogin);
router.post('/handleAdminLogin', accountController.handleAdminLogin);

//LOGIN
router.get('/login', accountController.customLogin);
router.post('/handleLogin', accountController.handleCustomerLogin);

//REGISTER
router.get('/register', accountController.customerRegister);
router.post('/handleRegister', accountHelp.hasExistAccountName, accountController.handleCustomerRegister);

//Logout
router.get('/logout', accountController.logout);

module.exports = router;