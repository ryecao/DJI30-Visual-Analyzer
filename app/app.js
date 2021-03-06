var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./data/db/dji30.db');
var app = express();

app.use(bodyParser());

app.get('/api', function (request, response) {

    var startDate = request.query.startDate;
    var endDate = request.query.endDate?request.query.endDate:startDate;
    var codeArray = request.query.code.split(',');
    var ret = [];

    var getSingleResult = function (code, callback) {
        var req = "SELECT * FROM " + code + " WHERE DATE BETWEEN '" + startDate + "' AND '"+ endDate +"'" ;
        db.all(req, function (err, rows) {
            var data = {'CODE': code, 'DATA': rows};
            callback(data);
        });
    };

    var getResults = function () {
        if (codeArray.length == 0) {
            response.json(ret);
            return;
        }
        var code = codeArray.shift();
        getSingleResult(code, function (data) {
            ret.push(data);
            getResults();
        });
    };

    getResults();

});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
