const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Order = new Schema({
    _id: { type : Number}, // order ID
    customerId: {type: String, maxLength: 255},
    date: {type: Date},
    total: {type: Number, maxLength: 255},
    confirmed: {type: Number}
}, {
    _id: false,
    timestamps: true
});

// use autoincrement
Order.plugin(AutoIncrement);

module.exports = mongoose.model('order', Order);

