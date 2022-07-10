const Product = require('../models/product.model');
const Category = require('../models/category.model');
const {mutipleMongooseToObject, mongooseToObject} = require('../../utils/mongoose');
const categoryHelp = require('../../utils/categoryHelp');
const productHelp = require('../../utils/productHelp');
const imageHelp = require('../../utils/imageHelp');
const upload = require('../middlewares/upload.mdw');

class shoeController {
    // [GET] /product
    manager(req, res, next) {
        Product.find({})
        .then((shoes)=>{
            shoes = mutipleMongooseToObject(shoes);
            res.render('adminPages/product/manager', {
                shoes,
                layout: 'adminLayout'
            });
        })
    }

    // [GET] /product/add
    create(req, res, next) {
        if(req.query != 'warning')
        delete req.session.errImage;
        res.render('adminPages/product/productAdd', {layout: 'adminLayout'});
    }
    // [POST] /product/save
    saveCreate(req, res) {
        upload('image')(req, res, async function(err) {
            if(err) {
                // url for redirect back
                const backUrl = req.header('Referer') || '/';
                //throw error for the view...
                req.session.errImage = err;
                return res.redirect(backUrl + '?warning'); 
            }
            const formData = req.body; 
            formData.arrayImage = imageHelp.createArrayImage(req.files);
            formData.size = productHelp.setAmountForSize(req.body.size, req.body.amountOfSize);
            formData.amount = productHelp.setAmount(req.body.amountOfSize);
            const product = new Product(formData);
            await product.save()
                .then(() => {
                    res.redirect('/admin/product');
                })
                .catch((err) => console.log(err));
        });
    }

    // [GET] /product/update/:id
    update(req, res, next) {
        // have err in process update image
        if(req.query != 'warning') 
        delete req.session.errImage;
        // display product need update to view...
        Product.findOne({_id: req.params.id})
            .then((product) => {  
                const result = mongooseToObject(product);
                res.render('adminPages/product/productUpdate', {
                    result,
                    layout: 'adminLayout'
                })
            })
            .catch(err => console.log(err));
    }
    // [PUT] /product/saveUpdate/:id
    saveUpdate(req, res, next) {
        upload('image')(req, res, function(err) {
            if(err) {
                // url for redirect back
                const backUrl = req.header('Referer') || '/';
                //throw error for the view...
                req.session.errImage = err;
                return res.redirect(backUrl + '?warning'); 
            }
            // get information of product and update product
            Product.findOne({_id: req.params.id})
                .then((product) => {
                    product = mongooseToObject(product);
                    req.body.arrayImage = imageHelp.handleImageUpdate(req, product);
                    console.log("🚀 ~ file: shoeController.js ~ line 82 ~ shoeController ~ .then ~ req.body.arrayImage", req.body.arrayImage)
                    req.body.size = productHelp.setAmountForSize(req.body.size, req.body.amountOfSize);
                    req.body.amount = productHelp.setAmount(req.body.amountOfSize);
                    Product.updateOne({_id: req.params.id}, req.body)
                        .then(() => {
                            // res.redirect('/admin/product');
                            console.log('done');
                        });
                })
                .catch((err) => {
                    console.log(err);
                }) 
        });
    }
    
    // [DELETE] /product/delete/:id
    delete(req, res) {
        Product.deleteOne({_id: req.params.id})
            .then(() => res.redirect('/admin/product'))
            .catch((err) => console.log(err));
    }
    

    // CLIENT
    // display product in home
    displayAllProduct(req, res) {
        // if have request search Product
        if(req.body.search) {
            let object = productHelp.setCondition(req.body, 'search');
            Product.find(object).then(shoes => {
                shoes = mutipleMongooseToObject(shoes);
                if(req.header('Referer') === 'http://localhost:3000/' || req.header('Referer') === 'http://localhost:3000/shoes/shoeByGender') {
                    res.json({
                        beforeUrl: req.header('Referer'), 
                        data: shoes
                    });
                }
                else {
                    res.json({
                        search: req.body.search
                    });
                }    
            }).catch(err => console.log(err));
        }
        // display all product
        else {
            Product.find({})
            .then((shoes) => {
                shoes = mutipleMongooseToObject(shoes);
                res.render('home', {shoes});
            })
            .catch((err) => console.log(err));
        }
    }

    productDetail(req, res) {
        Product.findOne({_id: req.params.id})
        .then((shoe) => {
            shoe = mongooseToObject(shoe);
            res.render('productDetail', {shoe});
        })
        .catch((err) => console.log(err));
    }

    // display product in shoe By Gender
    displayShoeByGender(req, res) {
        // if have query search in another page throw it to shoeByGender
        if(req.query.search) {
            let object = productHelp.setCondition(req.body, 'search');
            Product.find(object).then(shoes => {
                shoes = mutipleMongooseToObject(shoes);
                res.render('shoeByGender', {shoes});
            }).catch((err) => console.log(err));
        }
        // if have request filter product
        else if(req.body.brand || req.body.style) {
            let object = productHelp.setCondition(req.body, 'filter');
            Product.find({$and: [
                object
            ]}).then(shoes => {
                shoes = mutipleMongooseToObject(shoes);
                res.json({msg: 'success', data: shoes});
            }).catch(err => console.log(err));
        }
        // display all product in shoes by gender
        else {
            Product.find({}).then(shoes => {
                shoes = mutipleMongooseToObject(shoes);
                res.render('shoeByGender', {shoes});
            })
        }
    }

}

module.exports = new shoeController();