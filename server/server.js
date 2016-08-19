var loopback = require('loopback');
var boot = require('loopback-boot');
var http = require('http');
var socket = require('socket.io');
var io = socket(http);
var app = module.exports = loopback();
var path = require('path');

app.get('/', function(req, res) {
    res.redirect('/index')
});

app.get('/index', function(req, res) {
    res.sendFile('index.html', {
        root: path.join(__dirname, '../client')
    });
});

app.get('/login', function(req, res) {
    res.sendFile('login.html', {
        root: path.join(__dirname, '../client')
    });
});

app.get('/signup', function(req, res) {
    res.sendFile('signup.html', {
        root: path.join(__dirname, '../client')
    });
});

app.start = function() {

    io.on('connection', function(socket) {
        console.log("A user is connected");
        socket.on('status added', function(status) {
            console.log("received");
        });
    });
    // start the web server
    return app.listen(function() {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});
