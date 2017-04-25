
//initializes the authentication interface for app
var mongoose = require('mongoose');

var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = {'jwtsecret': "MY_SECRET"}

var authSchema = new mongoose.Schema({
	username: {
		type: String,
		unique: true,
		required: true
	},
  name: {
    type: String,
    required: true
  },
	hash: String,
	salt: String
});

// authSchema.methods.setPassword = function(password){
// 	this.salt = crypto.randomBytes(16).toString('hex');
// 	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
// };

authSchema.methods.validPassword = function(password) {
  var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
  return this.hash === hash;
};

authSchema.methods.generateJwt = function() {
  var expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  return jwt.sign({
    _id: this._id,
    email: this.email,
    name: this.name,
    exp: parseInt(expiry.getTime() / 1000),
  }, config.jwtsecret); // Move to config?
};

var Auth = module.exports = mongoose.model('Auth', authSchema);

module.exports.createToken = function(token,password, callback){
  token.salt = crypto.randomBytes(16).toString('hex');
  token.hash = crypto.pbkdf2Sync(password, token.salt, 1000, 64).toString('hex');
  token.save(callback)
}

module.exports.decodeToken = function(token, callback){
  jwt.verify(token, config.jwtsecret, function(err, decoded) {
    if(err){callback(err, 0)}
    callback(false, decoded)
  })
}

// var config = require("../../../config/config.json")

// //initialize mongoDB crud
// var db = require('../mongodb')

// function checkCookies(cookie_str, callback) {
// 	// check whether the cookie value exists, returns the username associated with cookie value
// 	if(cookie_str !== undefined){
// 		// cookie exists
// 		db.find('cookies', {'cookie_val': cookie_str}, function(err,results) {
// 			if (!err) {
// 				if(results !== null && results['expiry'] >= Date.now()) {
// 					// cookie is valid
// 					updateCookie(cookie_str, function(err,results){
// 						if (!err) {
// 							// updated cookie
// 							callback(false, true, results)
// 						} else {
// 							console.log('db error:', err)
// 						}
// 					})
// 				}
// 				else {
// 					// cookie is invalid
// 					deleteCookie(cookie_str, function(err){
// 						if (!err) {
// 							// removed cookie
// 							callback(false, false, results)
// 						} else {
// 							console.log('db error:', err)
// 						}
// 					})
// 				}
// 			} else {
// 				console.log('db error:', err)
// 			}
// 		})
// 	}
// 	else{
// 		// no cookie
// 		callback(false, false, undefined)
// 	}
// }

// function setCookie(username, cookie_str, callback) {
// 	// creates a cookie if user doesn't have one assigned already
// 	db.find('cookies',{'cookie_user': username}, function(err,results){
// 		if (!err) {
// 			if(results === null){
// 				db.write('cookies', {'cookie_val': cookie_str, 'cookie_user': username, 'expiry': Date.now() + 30000}, function(err,results) {
// 					if (!err) {
// 						callback(false)
// 					} else {
// 						console.log('db error:', err)
// 					}
// 				})
// 			}
// 			else{
// 				db.update('cookies', {'cookie_user': username}, {'cookie_val': cookie_str, 'expiry': Date.now() + 30000}, function(err,results) {
// 					if (!err) {
// 						callback(false, results)
// 					} else {
// 						console.log('db error:', err)
// 					}
// 				})
// 			}
// 		} else {
// 			console.log('db error:', err)
// 		}
// 	})
// }

// function updateCookie(cookie_str, callback) {
// 	// updates the cookie expiration
// 	db.update('cookies', {'cookie_val': cookie_str}, {'expiry': Date.now() + 300000}, function(err,results) {
// 		if (!err) {
// 			callback(false, results)
// 		} else {
// 			console.log('db error:', err)
// 		}
// 	})
// }

// function deleteCookie(cookie_str, callback) {
// 	// deletes the cookie
// 	db.remove('cookies', {'cookie_val': cookie_str}, function(err,results) {
// 		if (!err) {
// 			callback(false)
// 		} else {
// 			console.log('db error:', err)
// 		}
// 	})
// }

// module.exports = {
// 	checkCookies,
// 	setCookie,
// 	updateCookie,
// 	deleteCookie
// 	}