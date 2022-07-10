const Account = require('../models/account.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtHelp = require('../../utils/jwtHelp');
const {mutipleMongooseToObject, mongooseToObject} = require('../../utils/mongoose');
const passport = require('passport');
require('dotenv').config();

class accountController {
    // [GET] /account/adminLogin
    adminLogin(req, res) {
        res.render('adminPages/adminLogin', {layout: false});
    }
    
    // [POST] /account/handleAdminLogin
    handleAdminLogin(req, res) {
        Account.findOne({email: req.body.email})
            .then(async(account) => {
                //check account
                account = mongooseToObject(account);
                const result = bcrypt.compareSync(req.body.password, account.password);
                if(result) {
                    jwtHelp.encodeAndStoreToken(account.userId, account.permission, account.fullname, account.picture, res);
                    return res.redirect('/admin');
                }
            });
    }

    //CUSTOMER
    //[GET] /account/login
    customLogin(req, res) {
        res.render('customerLogin', {layout: false});
    }

    // [POST] /account/handleCustomerLogin
    handleCustomerLogin(req, res) {
        Account.findOne({email: req.body.email})
        .then((account) => {
            if(account) {
                account = mongooseToObject(account);
                const result = bcrypt.compareSync(req.body.password, account.password);
                if(result) {
                    const tokens = jwtHelp.generateToken(account._id, account.fullname, account.permission);
                    res.cookie('Authorization', tokens.accessToken, { 
                        maxAge: 600000,
                        httpOnly: true,
                    });
                    res.cookie('RefreshToken', tokens.refreshToken, {
                        maxAge: 600000, 
                        httpOnly: true 
                    });
                    return res.redirect('/');
                }
                req.session.loginErr = 'Your password is incorrect. Please try again.';
                return res.redirect('back');
            }
            req.session.loginErr = 'Your account name or your password is incorrect. Please try again.';
            return res.redirect('back');
        })
        .catch((err) => console.log(err))
    }

    //[GET] /account/register
    customerRegister(req, res) {
        if(!req.query.warning)
        delete req.session.registerErr; 
        res.render('customerRegis', {layout: false});
    }

    //[POST] /account/saveRegister
    handleCustomerRegister(req, res) {
        req.body.permission = '2';
        const newAccount = new Account(req.body);
        newAccount.save()
            .then(res.render('customerLogin', {layout: false}))
            .catch((err) => console.log(err));
    }

    // encode token of user when they authenticate successfull from facebook or google
    encodeAndStoreToken(req, res) {
        // encode token and store accessToken and refreshToken to cookie
        jwtHelp.encodeAndStoreToken(req.user.userId, req.user.permission, req.user.fullname, req.user.picture, res);
        res.redirect('/account/testAuth');
    }
    // after authenticate successful by google account
    testAuth(req, res) {
        res.json(req.cookies.userInfo);
    }

    //logout function
    logout(req, res) {
        // req.logout();
        res.clearCookie('Authorization');
        res.clearCookie('refreshToken');
        res.clearCookie('userInfo');
        res.redirect('/');
    }
}

module.exports = new accountController();