module.exports = {
    mutipleMongooseToObject: (list) => {
        return list.map(list => list.toObject());
    },
    mongooseToObject: (mongoose) => {
        return mongoose ? mongoose.toObject() : mongoose;
    }
}