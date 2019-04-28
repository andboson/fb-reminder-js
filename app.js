var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var config = require('./config.json');
const { FBClient } = require('./facebook/fb_client');
const { Reminders } = require('./reminders/reminder');
const { Scheduler } = require('./reminders/scheduler');


var { Intents } = require('./dialogflow/intents');

var webhookRouter = require('./routes/webhook');

var app = express();
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.disable('x-powered-by');

Intents.create();
//Intents.list();


//set menu
let fb = FBClient.New();
fb.SetChatProfile();

// run job
Scheduler.Start(fb, Reminders);


var checkKey = function (req, res, next) {
    req.requestTime = Date.now();
    if (  req.header('X-Key') !== config.x_key ){
      // return;
    }

    req.fb = fb;
    req.db = Reminders;
    next();
  };
  
app.use(checkKey);
app.use('/', webhookRouter);


module.exports = app;
