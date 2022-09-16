const { ACCESS_JWT_SECRET, REFRESH_JWT_SECRET } = require("../config/index");
require("dotenv").config();

const Account = require("../app/models/account.model");
const jwt = require("jsonwebtoken");

class jwtHelp {
	encodeAndStoreToken(userId, permission, fullname, picture, res) {
		const accessToken = jwt.sign(
			{
				userId: userId,
				permission: permission,
				fullname: fullname,
				iat: new Date().getTime(),
				exp: new Date().setDate(new Date().getDate() + 3), // exp in 3 days
			},
			ACCESS_JWT_SECRET
		);

		const refreshToken = jwt.sign(
			{
				userId: userId,
				permission: permission,
				fullname: fullname,
				iat: new Date().getTime(),
				exp: new Date().setDate(new Date().getDate() + 210), // exp in 210 days
			},
			REFRESH_JWT_SECRET
		);
		return { accessToken, refreshToken };
		// store accessToken
		// res.cookie("Authorization", accessToken, {
		// 	maxAge: process.env.TIME_COOKIE_ACCESS_TOKEN_EXPIRE, // three dates
		// 	httpOnly: true,
		// });
		// // store refreshToken
		// res.cookie("refreshToken", refreshToken, {
		// 	maxAge: process.env.TIME_COOKIE_REFRESH_TOKEN_EXPIRE, // 210 dates
		// 	httpOnly: true,
		// });
		// // store user info to use
		// res.cookie(
		// 	"userInfo",
		// 	{
		// 		userId: userId,
		// 		userName: fullname,
		// 		userPicture: picture,
		// 	},
		// 	{
		// 		maxAge: process.env.TIME_COOKIE_EXPIRE,
		// 		httpOnly: true,
		// 	}
		// );
	}

	createAccessToken(userId, permission, fullname) {
		return jwt.sign(
			{
				userId: userId,
				permission: permission,
				fullname: fullname,
				iat: new Date().getTime(),
				exp: new Date().setDate(new Date().getDate() + 3),
			},
			ACCESS_JWT_SECRET
		);
	}

	authAccessToken(req, res) {
		try {
			// const token = req.cookies.Authorization;
			const token = req.body.token;
			// 7 is length of string you want to find subString, endsWith function is find subString in final of String
			// if user don't have token and want go to admin route redirect adminLogin

			// render interface login with role
			if (!token) {
				// if user(admin) don't have token redirect admin Login
				// if (req.originalUrl.endsWith("/admin/", 7)) {
				// 	return res.redirect("/account/adminLogin");
				// }
				// if user don't have token redirect customer Login
				// else {
				// 	return res.redirect("/account/login");
				// }
				res.status(400).send();
			}

			// if have token start to decode and verify token
			const decode = jwt.decode(token);
			jwt.verify(token, ACCESS_JWT_SECRET);
			// if user have token and access route admin but not admin redirect to home
			// if (req.originalUrl.endsWith("/admin/", 7) && decode.permission !== 0) {
			// 	return res.redirect("/");
			// }
			if (decode.permission !== 0) {
				res.status(403).send();
			}
			res.send("Verify Token Success");
		} catch (err) {
			// if accessToken expired, renew accessToken if refreshToken isn't expired
			if (err.name === "TokenExpiredError") {
				// jwtHelp.renewAccessToken(req, res);
				res.send("Token expired");
			} else {
				res.send("Invalid token");
			}
		}
	}

	renewAccessToken(req, res) {
		const refreshToken = req.body.refreshToken;
		if (!refreshToken) {
			res.status(400).send();
		}
		try {
			const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			const accessToken = this.createAccessToken(
				decode.userId,
				decode.permission,
				decode.fullname
			);
			// res.cookie("Authorization", accessToken, {
			// 	maxAge: process.env.TIME_COOKIE_EXPIRE,
			// 	httpOnly: true,
			// });
			// return res.redirect("back");
			res.status(201).send(accessToken);
		} catch (err) {
			// if refreshToken is expired, redirect to home
			// if (err.name === "TokenExpiredError") {
			// 	return res.redirect("/");
			// }
			res.status(400).send(err);
		}
	}
}

module.exports = new jwtHelp();
