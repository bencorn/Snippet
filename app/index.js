
// Requires
var config = require('../config/config.json')
var path = require('path')
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var FacebookStrategy = require('passport-facebook');
var mongoose = require('mongoose');
mongoose.connect(config.mongo_url + '/admin');
var cookieParser = require('cookie-parser');

var db = mongoose.connection;

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cookieParser());

// Passport Init
app.use(passport.initialize());
app.use(passport.session());

// View Engine
app.set('view engine', 'ejs')
// directory for serving views
app.set('views', path.join(__dirname, 'router/views'))

app.use('/bower_components', express.static(path.join(__dirname, 'bower_components/')))
app.use('/js', express.static(path.join(__dirname, 'js/')))
app.use(express.static(path.join(__dirname, 'public')));

// Include Routes
require('./router').init(app);

module.exports = app;