const Category = require('../models/category.model');
const {mutipleMongooseToObject, mongooseToObject} = require('../../utils/mongoose');
const categoryHelp = require('../../utils/categoryHelp');

class cateController {
    // [GET] /category?type='...'
    async manager(req, res, next) {
        // Can use lean() as a callback to change mongoooseList to Object
        await Category.find({type: req.query.type})
            .then(cates => {
                res.render('adminPages/category/manager', {
                    cates: mutipleMongooseToObject(cates),
                    labels: categoryHelp.setUpLabels(req.query.type),
                    type: req.query.type,
                    layout: 'adminLayout'
                });
            })
            .catch(err => {
                next(err);
            })     
    }

    // [GET] /category/add
    create(req, res, next) {
        res.render('adminPages/category/addCategory', {
            type: req.query.type,
            labels: categoryHelp.setUpLabels(req.query.type),
            layout: 'adminLayout'
        });
    }
    // [POST] /category/save
    async saveCreate(req, res, next) {
        req.body.type = req.query.type;
        const newCategory = req.body;
        const cate = new Category(newCategory);
        await cate.save()
            .then(() => {
                res.redirect(`/admin/category?type=${req.query.type}`);
            })
            .catch((err) => console.log(err));
    }

    // [GET] /category/update/:id
    async update(req, res, next) {
        await Category.findById({_id: req.params.id})
            .then(cate => {
                res.render('adminPages/category/categoryUpdate', {
                    cate: mongooseToObject(cate),
                    labels: categoryHelp.setUpLabels(req.query.type),
                    type: req.query.type,
                    layout: 'adminLayout'
                });
            })
            .catch((err) => console.log(err));
    }
    //[PUT] /category/saveUpdate/:id
    async saveUpdate(req, res, next) {
        await Category.updateOne({_id: req.params.id}, req.body)
            .then(() => res.redirect(`/admin/category?type=${req.query.type}`))
            .catch(err => console.log(err));
    }

    //[DELETE] /category/delete/:id
    async delete(req, res) {
        await Category.deleteOne({_id: req.params.id})
            .then(res.redirect('back'))
            .catch(err => console.log(err));
    }

    // FIND Category
    // [GET] /category/:slug
    async findCategoryByName(req, res, next) {
        let object = {};
        // string don't have upperCase
        object.name = new RegExp(req.params.slug, 'i');
        await Category.find(object)
            .then(cates => {
                res.render('adminPages/category/manager', {
                    cates: mutipleMongooseToObject(cates),
                    labels: categoryHelp.setUpLabels(req.query.type),
                    layout: 'adminLayout'
                });
            })
            .catch(err => {
                next(err);
            })     
    }
}

module.exports = new cateController();