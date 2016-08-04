var loopback = require("loopback");
module.exports = function (Order) {
    /*Order.observe('before save', function name(ctx, next) {
        var inst = ctx.newInstance;
        next();
    });*/

    Order.postOrder = function (order, cb) {
        var data = {};
        data.destination = order.destination;
        data.status = order.paymentType === "CASH" ? "COS" : "PAID";

        var orderList = [];


        var model = loopback.getModel("Item");
        var queryIds = order.orderedItems.map(function (item) {
            return item.id;
        })
        var query = { "where": { "id": { "inq": queryIds } } };
        model.find(query, function (err, res) {
            orderList = res.map(function (data) {
                var obj = {};
                obj["item"] = data.__data;
                obj["quantity"] = order.orderedItems.filter(function(da){
                    return da.id = data.id;
               })[0].quantity;
               return obj;
                
            });
            var price = 0;
            order.orderedItems.forEach(function (order) {
                price += orderList.filter(function (o) {
                    return o.item.id === order.id;
                })[0].item.price * order.quantity;

            });
            data.orderList = orderList;
            data.totalAmount = price;
            
            Order.create(data, function (err, res) {
                cb(null, res.__data);
            });


        })



    }

    Order.remoteMethod(
        'postOrder',
        {
            accepts: [{ type: 'object', required: true, http: { source: 'body' } }],
            returns: { arg: 'status', type: 'object' }
        }
    );

};
