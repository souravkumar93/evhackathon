var path = require('path');

module.exports = function(app) {

    app.get('/', function(req, res) {
        console.log("/")
        res.redirect('/index')
    });

    app.get('/index', function(req, res) {
        console.log("/index")
        res.sendFile('index.html', {
            root: path.join(__dirname, '../../client')
        });
    });

    app.get('/login', function(req, res) {
        console.log("/login")
        res.sendFile('login.html', {
            root: path.join(__dirname, '../../client')
        });
    });

    app.get('/signup', function(req, res) {
        res.sendFile('signup.html', {
            root: path.join(__dirname, '../../client')
        });
    });
};
