const { ACCESS_JWT_SECRET, REFRESH_JWT_SECRET } = require('../config/index');
require('dotenv').config();

const Account = require('../app/models/account.model');
const jwt = require('jsonwebtoken');

class jwtHelp {
    encodeAndStoreToken(userId, permission, fullname, picture, res) {
        const accessToken =  jwt.sign({
            userId: userId,
            permission: permission,
            fullname: fullname,
            iat: new Date().getTime(),
            exp: new Date().setDate(new Date().getDate() + 3) // exp in 3 days
        }, ACCESS_JWT_SECRET);   

        const refreshToken = jwt.sign({
            userId: userId,
            permission: permission,
            fullname: fullname,
            iat: new Date().getTime(),
            exp: new Date().setDate(new Date().getDate() + 210) // exp in 210 days
        }, REFRESH_JWT_SECRET);
        // store accessToken
        res.cookie('Authorization', accessToken, {
            maxAge: process.env.TIME_COOKIE_ACCESS_TOKEN_EXPIRE, // three dates 
            httpOnly: true 
        });
        // store refreshToken
        res.cookie('refreshToken', refreshToken, {
            maxAge: process.env.TIME_COOKIE_REFRESH_TOKEN_EXPIRE, // 210 dates 
            httpOnly: true 
        });
        // store user info to use
        res.cookie('userInfo', {
            'userId': userId,
            'userName': fullname,
            'userPicture': picture
        }, { 
            maxAge: process.env.TIME_COOKIE_EXPIRE, 
            httpOnly: true 
        });
    }

    creatAccessToken(userId, permission, fullname) {
        return jwt.sign({
            userId: userId,
            permission: permission,
            fullname: fullname,
            iat: new Date().getTime(),
            exp: new Date().setDate(new Date().getDate() + 3)
        }, ACCESS_JWT_SECRET);   
    }

    renewAccessToken(req, res ) {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) {
            return res.redirect('/');
        }
        try {
            const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const accessToken = this.creatAccessToken(decode.userId, decode.permission, decode.fullname);
            res.cookie('Authorization', accessToken, { 
                maxAge: process.env.TIME_COOKIE_EXPIRE, 
                httpOnly: true 
            });
            return res.redirect('back');
        }
        catch(err) {
            // if refreshToken is expired, redirect to home
            if(err.name === 'TokenExpiredError') {
                return res.redirect('/');
            }
        }
    }
}

module.exports = new jwtHelp();