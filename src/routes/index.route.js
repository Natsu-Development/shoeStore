const shoeRouter = require("./shoes.route");
const siteRouter = require("./site.route");
const cusRouter = require("./cus.route");
const accountRouter = require("./account.route");
const adminRouter = require("./admin.route");

// models and help of Category
const {
	mutipleMongooseToObject,
	mongooseToObject,
} = require("../utils/mongoose");
const Category = require("../app/models/category.model");
const categoryHelp = require("../utils/categoryHelp");
const Shoe = require("../app/models/product.model");
const Account = require("../app/models/account.model");
const passportConfig = require("../app/middlewares/passport.mdw");

// const verify = require('../app/middlewares/auth.mdw');
function route(app) {
	// locals, why session not access in handlebars?
	app.use(async (req, res, next) => {
		await Category.find({}).then((cates) => {
			cates = mutipleMongooseToObject(cates);
			var resultFilter = categoryHelp.filterCategory(cates);
			res.locals.listBrand = resultFilter.listBrand;
			res.locals.listStyle = resultFilter.listStyle;
			res.locals.listSize = categoryHelp.sortSize(resultFilter.listSize);
		});
		await Shoe.find({}).then((shoes) => {
			shoes = mutipleMongooseToObject(shoes);
			res.locals.listShoe = shoes;
		});
		// edit condition
		await Account.find().then((accounts) => {
			accounts = mutipleMongooseToObject(accounts);
			res.locals.listCustomer = accounts;
		});
		res.locals.errImage = req.session.errImage;
		res.locals.registerErr = req.session.registerErr;
		res.locals.loginErr = req.session.loginErr;
		next();
	});
	// admin routes
	app.use("/admin", passportConfig.auth, adminRouter);

	// shoe
	app.use("/shoes", shoeRouter);

	// account
	app.use("/auth", accountRouter);

	// cart and checkout
	app.use("/customerService", passportConfig.auth, cusRouter);

	// site and index
	app.use("/", siteRouter);
}

module.exports = route;
