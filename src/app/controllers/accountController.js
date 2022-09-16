const Account = require("../models/account.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtHelp = require("../../utils/jwtHelp");
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../../utils/mongoose");
require("dotenv").config();

class accountController {
	/**
	 * @swagger
	 * components:
	 *   schemas:
	 *     handleLogin:
	 *       type: object
	 *       properties:
	 *         email:
	 *           type: string
	 *           description: The account's email'.
	 *           example: example@gmail.com
	 *         password:
	 *           type: string
	 *           description: The account's password.
	 *           example: 12345678
	 */
	// [GET] /account/adminLogin
	adminLogin(req, res) {
		res.render("adminPages/adminLogin", { layout: false });
	}

	// [POST] /account/handleAdminLogin
	handleAdminLogin(req, res) {
		Account.findOne({ email: req.body.email }).then(async (account) => {
			//check account
			account = mongooseToObject(account);
			const result = bcrypt.compareSync(req.body.password, account.password);
			if (result) {
				jwtHelp.encodeAndStoreToken(
					account.userId,
					account.permission,
					account.fullname,
					account.picture,
					res
				);
				return res.redirect("/admin");
			}
		});
	}

	//CUSTOMER
	//[GET] /account/login
	customLogin(req, res) {
		res.render("customerLogin", { layout: false });
	}

	/**
	 * @swagger
	 * /auth/handleLogin:
	 *   post:
	 *     summary: User Login.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             $ref: '#/components/schemas/handleLogin'
	 *     responses:
	 *       201:
	 *         description: Login payload.
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  token:
	 *                    type: string
	 *                    description: The accessToken.
	 *                  refreshToken:
	 *                    type: string
	 *                    description: The refreshToken to refresh token.
	 *       400:
	 *         description: Login failed
	 */
	// [POST] /account/handleCustomerLogin
	handleCustomerLogin(req, res) {
		Account.findOne({ email: req.body.email })
			.then((account) => {
				if (account) {
					account = mongooseToObject(account);
					const result = bcrypt.compareSync(
						req.body.password,
						account.password
					);
					if (result) {
						const tokens = jwtHelp.encodeAndStoreToken(
							account._id,
							account.permission,
							account.fullname
						);
						// res.cookie("Authorization", tokens.accessToken, {
						// 	maxAge: 600000,
						// 	httpOnly: true,
						// });
						// res.cookie("RefreshToken", tokens.refreshToken, {
						// 	maxAge: 600000,
						// 	httpOnly: true,
						// });
						// return res.redirect("/");
						res.status(201).send(tokens);
					}
					// req.session.loginErr =
					// 	"Your password is incorrect. Please try again.";
					// return res.redirect("back");
					res.status(400).send();
				}
				// req.session.loginErr =
				// 	"Your account name or your password is incorrect. Please try again.";
				// return res.redirect("back");
				res.status(400).send();
			})
			.catch((err) => console.log(err));
	}

	//[GET] /account/register
	customerRegister(req, res) {
		if (!req.query.warning) delete req.session.registerErr;
		res.render("customerRegis", { layout: false });
	}

	//[POST] /account/saveRegister
	handleCustomerRegister(req, res) {
		req.body.permission = "2";
		const newAccount = new Account(req.body);
		newAccount
			.save()
			.then(res.render("customerLogin", { layout: false }))
			.catch((err) => console.log(err));
	}

	/**
	 * @swagger
	 * /auth/google:
	 *   post:
	 *     summary: Login by Google.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                userId:
	 *                  type: string
	 *                  description: The user's id.
	 *                fullname:
	 *                  type: string
	 *                  description: Full name of user.
	 *                email:
	 *                  type: string
	 *                  description: Email's account.
	 *                picture:
	 *                  type: string
	 *                  description: Account's avatar.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  token:
	 *                    type: string
	 *                  user:
	 *                    type: object
	 *                    properties:
	 *                       userId:
	 *                         type: string
	 *                       email:
	 *                         type: string
	 *                       fullname:
	 *                         type: string
	 *                       picture:
	 *                         type: string
	 *                       permission:
	 *                         type: integer
	 *       400:
	 *         description: Error
	 */
	async handleLoginGoogle(req, res) {
		try {
			//find user
			const existUser = await Account.findOne({ userId: req.body.userId });
			if (existUser) {
				// return done(null, existUser);
				res.json(existUser);
			} else {
				const newUser = new Account({
					fullname: req.body.fullname,
					userId: req.body.userId,
					email: req.body.email,
					address: "",
					numberPhone: "",
					permission: "2",
					authType: "google",
					picture: req.body.picture,
				});
				await newUser.save();
				const token = jwtHelp.createAccessToken(
					newUser.userId,
					newUser.permission,
					newUser.fullname
				);
				//return info of user when authenticate successful, store in variable req.user
				// return done(null, newUser);
				res.json({ token, newUser });
			}
		} catch (err) {
			// return done(null, {});
			res.status(400).send();
		}
	}

	/**
	 * @swagger
	 * /auth/facebook:
	 *   post:
	 *     summary: Login by Facebook.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                token:
	 *                  type: string
	 *                  description: The access token.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  token:
	 *                    type: string
	 *                    description: Verify access token success.
	 *       400:
	 *         description: Verify access token failed
	 */
	async handleLoginFacebook(req, res) {
		try {
			//find user
			const existUser = await Account.findOne({ userId: profile.id });
			if (existUser) {
				return done(null, existUser);
			} else {
				const newUser = new Account({
					fullname: profile.displayName,
					userId: profile.id,
					email: profile.emails[0].value,
					address: "",
					numberPhone: "",
					permission: "2",
					authType: profile.provider,
					picture: profile.photos[0].value,
				});
				await newUser.save();
				//return info of user when authenticate successful, store in variable req.user
				return done(null, newUser);
			}
		} catch (err) {
			return done(null, {});
		}
	}

	/**
	 * @swagger
	 * /auth/verifyToken:
	 *   post:
	 *     summary: Verify accessToken.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                token:
	 *                  type: string
	 *                  description: The access token.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  token:
	 *                    type: string
	 *                    description: Verify access token success.
	 *       400:
	 *         description: Verify access token failed
	 */
	authAccessToken(req, res) {
		jwtHelp.authAccessToken(req, res);
	}
	/**
	 * @swagger
	 * /auth/refreshToken:
	 *   post:
	 *     summary: Refresh accessToken.
	 *     requestBody:
	 *       required: true
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                refreshToken:
	 *                  type: string
	 *                  description: The refresh token.
	 *     responses:
	 *       201:
	 *         content:
	 *           application/json:
	 *             schema:
	 *               type: object
	 *               properties:
	 *                  token:
	 *                    type: string
	 *                    description: The accessToken from refresh.
	 *       400:
	 *         description: Refresh failed
	 */
	renewAccessToken(req, res) {
		jwtHelp.renewAccessToken(req, res);
	}

	// encode token of user when they authenticate successful from facebook or google
	encodeAndStoreToken(req, res) {
		// encode token and store accessToken and refreshToken to cookie
		jwtHelp.encodeAndStoreToken(
			req.user.userId,
			req.user.permission,
			req.user.fullname,
			req.user.picture,
			res
		);
		res.redirect("/auth/testAuth");
	}
	// after authenticate successful by google account
	testAuth(req, res) {
		res.json(req.cookies.userInfo);
	}

	//logout function
	logout(req, res) {
		// req.logout();
		res.clearCookie("Authorization");
		res.clearCookie("refreshToken");
		res.clearCookie("userInfo");
		res.redirect("/");
	}

	/**
	 * @swagger
	 * /auth/checkLog:
	 *   post:
	 *     summary: Check log.
	 *     requestBody:
	 *       content:
	 *         application/json:
	 *           schema:
	 *             type: object
	 *             properties:
	 *                data:
	 *                  type: string
	 *                  description: The data to log.
	 *     responses:
	 *       201:
	 *         description: Check log payload.
	 *       400:
	 *         description: Check log failed
	 */

	checkLog(req, res) {
		console.log("test Log", req.body);
		res.status(200);
	}
}

module.exports = new accountController();
