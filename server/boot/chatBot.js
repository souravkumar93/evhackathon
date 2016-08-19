var loopback = require('loopback');
var http = require('http');
var _ = require('lodash');
module.exports = function (app) {

    var bodyParser = require('body-parser');
    app.use(bodyParser.json());

    app.post('/chat', function (req, resp, next) {
        var response = {};
        response.content = '';
        response.type = 'res';
        if (req && req.headers) {
            var venueId = req.headers.venueid ? req.headers.venueid : 'vu222';
            var destination = req.headers.destination ? req.headers.destination : 'default';
            var userId = req.headers.userid ? req.headers.userid : 'default';
        }
        var postData = JSON.stringify(req.body);

        // var chat = loopback.findModel('ChatBot');
        // chat.create(req.body, function (err, data) {
        //     console.log(data);
        //     response.content = data.name;
        //     resp.json(response);
        // });

        var requestResponse = function () {
            var postheaders = {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData, 'utf8')
            };
            var options = {
                host: 'localhost',
                port: 8080,
                path: '/',
                method: 'POST',
                headers: postheaders
            };

            var botRequest = http.request(options, function (res) {
                res.setEncoding('utf8');
                res.on('data', function (msg) {
                    response.content = msg;
                    resp.json(response);
                });
            });

            botRequest.write(postData);
            botRequest.end();
            botRequest.on('error', function (e) {
                console.error(e);
            });
        }

        var giveResponse = function (itemList) {
            var menu = "";
            itemList.forEach(function (item) {
                menu += item.name + "  Rs" + item.price + "\n";//&#x20B9; &#8377;   &#x20B9;
            });
            response.content = menu;
            resp.json(response);
        }

        var giveConfirmation = function (err, orderId) {
            if (err) {
                response.content = "Your order items are out of stock.. please chose some thing else";
            } else if (orderId) {
                response.content = "order received.\nYour order no is " + orderId;
                resp.json(response);
            } else {
                response.content = "You order item is not available\Try some thing else";
                resp.json(response);
            }
        }

        var makeOrder = function (venueId, destination, cb) {
            var items = loopback.getModel('Item');
            var orderSummary = loopback.getModel('OrderSummary');
            var os = {
                "itemList": [],
                "deliveryLocation": destination,
                "paymentType": "COS",
                "userId": userId
            }
            var orderItems = req.body.name;
            orderItems = orderItems.split(',');
            var names = [];
            var quantities = [];
            for (i = 0; i < orderItems.length; i++) {
                names.push(orderItems[i].split('-')[1]);
                quantities.push(orderItems[i].split('-')[0]);
            };
            var query = {
                where: {
                    and: [{ "name": { "inq": names } },
                        { "venueId": venueId }]
                }
            };
            items.find(query, function (err, list) {
                if (err) {
                    console.log(err);
                    next(err);
                } else if (list.length) {
                    console.log(list);
                    _.forEach(list, function (element) {
                        var item = {
                            "name": element.name,
                            "quantity": quantities[_.indexOf(names, element.name)],
                            "itemId": element.itemId,
                            "vendorId": element.vendorId
                        }
                        os.itemList.push(item);
                    });
                    console.log(os);
                    orderSummary.placeOrder(os, function (err, data) {
                        if (err) {
                            cb(err, null);
                        } else if (data) {
                            cb(null, data.id);
                        } else {
                            cb(null, null);
                        }
                    });
                } else {
                    cb(null, null);
                }
            });

        }

        var getItems = function (venueId, cb) {
            var items = loopback.getModel('Item');

            items.find({ where: { "venueId": venueId } }, function (err, itemList) {
                if (err) {
                    console.log(err);
                    next(err);
                }
                cb(itemList);
            });
        }

        var doAnalysis = function (msg) {
            if (msg.indexOf('-') > 0) {
                return 'order';
            }
            if (msg.includes('item') || msg.includes('menu') || msg.includes('items')) {
                return 'menu'
            }
        }

        var requestType = doAnalysis(req.body.name.toLowerCase());

        if (requestType == 'order') {
            makeOrder(venueId, destination, giveConfirmation);
        } else if (requestType == 'menu') {
            getItems(venueId, giveResponse);
        } else {
            requestResponse();
        }

    });

};
