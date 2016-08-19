module.exports = function (model) {
  model.afterRemoteError('create', function (ctx, next) {
    //instance = ctx.error.body;
    //console.log(ctx.error.body);
    next();
  });
};
