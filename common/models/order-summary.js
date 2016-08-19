var loopback = require("loopback");
module.exports = function(OrderSummary) {
    //OrderSummary.observe('before save', function name(ctx, next) {
    //    console.log("OrderSummary before save");
    //    next();
    //});

    OrderSummary.placeOrder = function(order, cb) {
        var orderModel = loopback.getModel("Order");
        var itemModel = loopback.getModel("Item");
        var orderList = [];
        var queryIds = order.itemList.map(function(item) {
            return item.itemId;
        })
        var query = {
            "where": {
                "itemId": {
                    "inq": queryIds
                }
            }
        };
        itemModel.find(query, function(err, res) {
            var price = 0;
            order.itemList.forEach(function(item) {
                delete item.availableQuantity;
                delete item.venueId;
                item.quantity = item.quantity || 0;
                price += res.filter(function(o) {
                    if (o.itemId === item.itemId) {
                        item.price = o.price;
                    }
                    return o.itemId === item.itemId;
                })[0].price * item.quantity;

            });

            order.billAmount = price;
            order.orderDate = new Date();
            var subOrderData = {};
            order.itemList.forEach(function(subItem) {
                subOrderData[subItem.vendorId] = subOrderData[subItem.vendorId] || {};
                subOrderData[subItem.vendorId].amount = subOrderData[subItem.vendorId].amount || 0;
                subOrderData[subItem.vendorId].itemList = subOrderData[subItem.vendorId].itemList || [];

                subOrderData[subItem.vendorId].amount += subItem.price * subItem.quantity;
                subOrderData[subItem.vendorId].deliveryLocation =  order.deliveryLocation;
                var key = subItem.vendorId;
                delete subItem.vendorId;
                subOrderData[key].itemList.push(subItem);
            });
            var subOrders = [];
            Object.keys(subOrderData).forEach(function(index) {
                subOrderData[index]["vendorId"] = index;
                subOrders.push(subOrderData[index]);
            });
            OrderSummary.create(order, function(error, result) {
                if (error) {
                    console.log("ERROR while creating OrderSummary", error);
                    cb(error);
                } else {
                    result.vendorOrder.create(subOrders, function(err, subOrders) {
                        if (err) {
                            console.log("ERROR while creating orders", err);
                            cb(err);
                        } else {
                            cb(null, result.__data);
                        }
                    });
                }
            });

        });
    }

    OrderSummary.remoteMethod(
        'placeOrder', {
            accepts: {
                arg: 'order',
                type: 'object',
                http: {
                    source: 'body'
                }
            },
            returns: {
                arg: 'finalOrder',
                type: 'object'
            }
        }
    );
};