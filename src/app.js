const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const https = require("https");

//cookieParser
app.use(cookieParser());
//session
app.set("trust proxy", 1); // trust first proxy
app.use(
	session({
		secret: "SECRET",
		resave: false,
		saveUninitialized: true,
		cookie: {},
	})
);

// database
const db = require("./config/");
db.connect();
//override method (Post, put, patch)
app.use(methodOverride("_method"));

// express handlebars
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
Handlebars.registerHelper("json", function (content) {
	return JSON.stringify(content);
});
Handlebars.registerHelper("inc", function (value, options) {
	return parseInt(value) + 1;
});
app.engine(
	".hbs",
	exphbs({
		extname: ".hbs",
		helpers: {
			getCategoryAdded: (cateId, cateName, cateIdOfProduct) => {
				var output = "";
				if (cateId.toString() === cateIdOfProduct) {
					output = `<option value="${cateId}" selected>${cateName}</option>`;
				} else {
					output = `<option value="${cateId}">${cateName}</option>`;
				}
				return new Handlebars.SafeString(output);
			},
			getCategory: (cateId, cateName, cateIdOfProduct) => {
				console.log("...");
				if (cateId.toString() === cateIdOfProduct) {
					return new Handlebars.SafeString(`${cateName}`);
				}
			},

			formatCurrency: (price) => {
				return "$" + Number(price).toFixed(2);
			},

			setSubTotal: (quantity, price) => {
				return Number(quantity * price).toFixed(2);
			},

			getShoeName: (shoeIdOfOrderDetail, shoeId, shoeName) => {
				console.log("🚀 ~ file: app.js ~ line 84 ~ shoeId", shoeId);
				console.log(
					"🚀 ~ file: app.js ~ line 84 ~ shoeIdOfOrderDetail",
					shoeIdOfOrderDetail
				);
				var output = "";
				if (shoeId.toString() === shoeIdOfOrderDetail) {
					output = `<option value="${shoeId}" selected>${shoeName}</option>`;
				} else {
					output = `<option value="${shoeId}">${shoeName}</option>`;
				}
				return new Handlebars.SafeString(output);
			},
		},
	})
);
app.set("view engine", ".hbs");
app.set("views", "src/app/views");
// method public (get/post/...) and json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// static route to public for user and admin
// app.use('/public', express.static('public'));
app.use(express.static(path.join(__dirname, "public")));

// router
const route = require("./routes/index.route");
route(app);

// configure ssl server
const sslServer = https.createServer(
	{
		key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
		cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
	},
	app
);

const PORT = 3000;
sslServer.listen(PORT, () =>
	console.log(`Secure server has started on port ${PORT}`)
);
