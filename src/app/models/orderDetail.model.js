const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderDetail = new Schema({
    orderDetailId: {type: Number},
    shoeId: {type: String, maxLength: 255},
    size: {type: String, maxLength: 255},
    quantity: {type: Number, maxLength: 255},
    price: {type: Number, maxLength: 255}
}, {
    timestamps: true
});

module.exports = mongoose.model('orderDetail', OrderDetail);