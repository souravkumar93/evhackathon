var loopback = require("loopback");
module.exports = function(SnacksUser) {
    SnacksUser.afterRemote('login', function(context, opt, next) {
        var query = {
            "_id": opt.__data.userId
        }
        SnacksUser.findOne({
            "where": query
        }, function(err, result) {
            if (err)
                next(err);
            else {
                opt.__data.userType = result.userType;
                opt.__data.name = result.name;
                opt.__data.email = result.email;
                if (opt.__data.userType === 'seller') {
                    var Vendor = loopback.getModel("Vendor");
                    Vendor.findOne({
                        "where": {
                            userId: opt.__data.userId
                        }
                    }, function(err, result) {
                        if (err)
                            next(err);
                        else {
                            opt.__data.vendorId = result.vendorId;
                            next();
                        }
                    });
                } else
                    next();
            }
        });
    });

    SnacksUser.observe('after save', function(ctx, next) {
        var vendorModel = loopback.getModel("Vendor");
        var vendorData = {};
        vendorData.name = ctx.instance.name;
        vendorData.userId = ctx.instance.id;
        if (ctx.instance.userType === 'seller') {
            vendorModel.create(vendorData, function(err, res) {
                if (err) {
                    console.log(err);
                    next(err);
                } else {
                    res.user(ctx.instance);
                    next();
                }
            });
        }
    });
};
