var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var config = require('./config.json');


var webhookRouter = require('./routes/webhook');
var usersRouter = require('./routes/users');

var app = express();
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.disable('x-powered-by');

var requestTime = function (req, res, next) {
    req.requestTime = Date.now();
    if (  req.header('X-Key') !== config.x_key ){
       // return;
    }
    next();
  };
  
  app.use(requestTime);


app.use('/', webhookRouter);
app.use('/users', usersRouter);



module.exports = app;
