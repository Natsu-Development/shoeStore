const Order = require('../app/models/order.model');
const OrderDetail = require('../app/models/orderDetail.model');
const Product = require('../app/models/product.model');
const { mutipleMongooseToObject, mongooseToObject } = require('mongoose');


class orderHelp {
    // format order when client check out cart
    formatOrder(arrayShoeId, arraySize, arrayQuantity, arrayPrice) {
        var output = [];
        // if order don't have any suborder
        if(arrayQuantity === undefined) {
            return;
        }

        if(arrayQuantity.length === 1) {
            output.push({
                'shoeId': arrayShoeId,
                'size': arraySize,
                'quantity': arrayQuantity,
                'price': arrayPrice
            })
            return output;
        }

        // if order have subOrder start to format info of shoe to output to update
        for(var i = 0; i < arrayQuantity.length; i++) {
            output.push({
                'shoeId': arrayShoeId[i],
                'size': arraySize[i],
                'quantity': arrayQuantity[i],
                'price': arrayPrice[i]
            })
        }
        return output;
    }

    setTotalForNewOrder(arrayPrice, arrayQuantity) {
        var total = 0;
        if(arrayQuantity.length === 1) {
            total += arrayQuantity * arrayPrice;
            return total;
        }
        for(var i = 0; i < arrayQuantity.length; i++) {
            total += Number(arrayPrice[i] * arrayQuantity[i]);
        }
        return total;
    }

    // get next orderId
    async getOrderId() {
        // select max
        const maxOrderId = await Order.find({}).sort({_id:-1}).limit(1);
        if(maxOrderId.length === 0) {
            return 1;
        }
        return maxOrderId[0]._id + 1;
    }
 
    async handleSubOrderUpdate(listForUpdate, listSubOrder) {
        for (var i = 0; i < listForUpdate.length; i++) {
			// update subOrder from listSubOrder (info of shoe in subOrder) and listForUpdate(id of subOrder)
			await OrderDetail.findOneAndUpdate({ _id: listForUpdate[i] }, listSubOrder[i]) // why await 
				.then((orderDetail) => {                    
					this.handleAmount(orderDetail, listSubOrder[i]);
				})
				.catch((err) => console.log(err));
		}
    }

    handleNewSubOrder(listForAdd, listSubOrder, orderId) {
        for (var i = 0; i < listForAdd.length; i++) {
			// set id of order for order Details (subOrder)
			listSubOrder[listForAdd[i]].orderDetailId = orderId;
			// create new subOrder and save
			const newSubOrder = new OrderDetail(listSubOrder[listForAdd[i]]);
			newSubOrder.save().then((newSubOrder) => {
				// decrease amount of Product in listForAdd
				this.decreaseAmountProduct(newSubOrder);
			});
		}
    }

    handleSubOrderDelete(listForDelete) {
        for (var i = 0; i < listForDelete.length; i++) {
			// if length of id in listForDelete not greater than 3 then this subOrder for delete not exist in database
			if (listForDelete[i].length > 3) {
				OrderDetail.findOneAndDelete({ _id: listForDelete[i] })
					.then((subOrderDelete) => {
						this.increaseAmountProduct(subOrderDelete);
					})
					.catch((err) => console.log(err));
			}
		}
    }

    // handle Amount of Product when update or delete
    handleAmount(oldSubOrder, subOrderUpdate) {
        // if shoeId not change (user don't edit shoe in subOrder want to update) and amount of product is changed 
        if(oldSubOrder.shoeId === subOrderUpdate.shoeId && oldSubOrder.quantity !== Number(subOrderUpdate.quantity)) {
            this.handleAmountInSameProduct(oldSubOrder, subOrderUpdate);
        }
        // if shoeId change (user select other shoe in subOrder want to update)
        else if(oldSubOrder.shoeId !== subOrderUpdate.shoeId) {
            // return (increase) amount of shoe in subOrder before for Shoe 
            this.increaseAmountProduct(oldSubOrder);

            // eliminate amount of shoe in subOrder update
            this.decreaseAmountProduct(subOrderUpdate);
        }
    }
    
    // trim array from request of client (req.query)
    trimArray(reqQuery) {
        reqQuery = reqQuery.replace(/,+/g, ','); //replace two commas with one commas 
        reqQuery = reqQuery.replace(/,\s*$/, ""); //replace last commas in string
        reqQuery = reqQuery.split(',');
        if(reqQuery[0]==='') {
            return [];
        }
        return reqQuery;
    }

    // handle amount when update subOrder in the same product
    handleAmountInSameProduct(oldSubOrder, subOrderUpdate) {
        var amount, sizeToSave;
        Product.findOne({_id: oldSubOrder.shoeId})
            .then((product) => {
                // find the size of shoe match with size need update
                product.size.forEach(objectSize => {
                    if(objectSize.size === oldSubOrder.size) {
                        objectSize.amount = Number(objectSize.amount);
                        objectSize.amount += oldSubOrder.quantity;
                        objectSize.amount -= Number(subOrderUpdate.quantity);
                        amount = objectSize.amount;
                        sizeToSave = objectSize;
                                                
                        this.saveChangeAmountOfProduct(subOrderUpdate.shoeId, sizeToSave, amount);
                    } 
                });
            });

    }

    // increase amount of product (situation: delete subOrder)
    increaseAmountProduct(subOrder) {
        var amount, sizeToSave;
        Product.findOne({_id: subOrder.shoeId})
        .then((product) => {
            product.size.forEach(objectSize => {
                if(objectSize.size === subOrder.size) {
                    objectSize.amount = Number(objectSize.amount);
                    objectSize.amount += Number(subOrder.quantity); 
                    amount = objectSize.amount;
                    sizeToSave = objectSize;
                    console.log("🚀 ~ file: orderHelp.js ~ line 154 ~ orderHelp ~ .then ~ objectSize.amount", objectSize.amount)

                    this.saveChangeAmountOfProduct(subOrder.shoeId, sizeToSave, amount);
                }
            })
        });
    }

    // decrease amount of Product (situation: add subOrder)
    decreaseAmountProduct(newSubOrder) {
        var amount, sizeToSave;
        
        Product.findOne({_id: newSubOrder.shoeId})
        .then((product) => {
            product.size.forEach(objectSize => {
                if(objectSize.size === newSubOrder.size) {
                    objectSize.amount = Number(objectSize.amount);
                    objectSize.amount -= Number(newSubOrder.quantity); 
                    amount = objectSize.amount;
                    sizeToSave = objectSize;

                    console.log("🚀 ~ file: orderHelp.js ~ line 174 ~ orderHelp ~ .then ~ objectSize.amount", objectSize.amount)
                    
                    this.saveChangeAmountOfProduct(newSubOrder.shoeId, sizeToSave, amount);
                }
            })
        });
    } 

    // save changes amount of product
    saveChangeAmountOfProduct(shoeId, sizeToSave, amount) {
        Product.updateOne(
            { _id: shoeId, 'size.size': sizeToSave.size},
            {$set: {'size.$.amount': amount }}
        ).then(() => {console.log('saved')});
    }

    setTotalForOrderUpdate(orderId) {
		var total = 0;
		// find OrderDetail by Order id
		OrderDetail.find({ orderDetailId: orderId })
        .then((orderDetails) => {
            // orderDetails = mutipleMongooseToObject(orderDetails);
            for (var i = 0; i < orderDetails.length; i++) {
                total += Number(orderDetails[i].quantity * orderDetails[i].price);
            }
            console.log("🚀 ~ file: orderHelp.js ~ line 197 ~ orderHelp ~ setTotalForOrderUpdate ~ total", total)
            // update total of Order
            Order.updateOne(
                { _id: orderId }, 
                { $set: {total} }
            ).then(() => {console.log('done')})
        })
        .catch((err) => console.log(err));
        
    }
}

module.exports = new orderHelp();