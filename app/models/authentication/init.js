
//initializes the authentication interface for app

var config = require("../../../config/config.json")

//initialize mongoDB crud
var db = require('../mongodb')

function checkCookies(cookie_str, callback) {
	// check whether the cookie value exists, returns the username associated with cookie value
	if(cookie_str !== undefined){
		// cookie exists
		db.find('cookies', {'cookie_val': cookie_str}, function(err,results) {
			if (!err) {
				if(results !== null && results['expiry'] >= Date.now()) {
					// cookie is valid
					updateCookie(cookie_str, function(err,results){
						if (!err) {
							// updated cookie
							callback(false, true, results)
						} else {
							console.log('db error:', err)
						}
					})
				}
				else {
					// cookie is invalid
					deleteCookie(cookie_str, function(err){
						if (!err) {
							// removed cookie
							callback(false, false, results)
						} else {
							console.log('db error:', err)
						}
					})
				}
			} else {
				console.log('db error:', err)
			}
		})
	}
	else{
		// no cookie
		callback(false, false, undefined)
	}
}

function setCookie(username, cookie_str, callback) {
	// creates a cookie if user doesn't have one assigned already
	db.find('cookies',{'cookie_user': username}, function(err,results){
		if (!err) {
			if(results === null){
				db.write('cookies', {'cookie_val': cookie_str, 'cookie_user': username, 'expiry': Date.now() + 30000}, function(err,results) {
					if (!err) {
						callback(false)
					} else {
						console.log('db error:', err)
					}
				})
			}
			else{
				db.update('cookies', {'cookie_user': username}, {'cookie_val': cookie_str, 'expiry': Date.now() + 30000}, function(err,results) {
					if (!err) {
						callback(false, results)
					} else {
						console.log('db error:', err)
					}
				})
			}
		} else {
			console.log('db error:', err)
		}
	})
}

function updateCookie(cookie_str, callback) {
	// updates the cookie expiration
	db.update('cookies', {'cookie_val': cookie_str}, {'expiry': Date.now() + 300000}, function(err,results) {
		if (!err) {
			callback(false, results)
		} else {
			console.log('db error:', err)
		}
	})
}

function deleteCookie(cookie_str, callback) {
	// deletes the cookie
	db.remove('cookies', {'cookie_val': cookie_str}, function(err,results) {
		if (!err) {
			callback(false)
		} else {
			console.log('db error:', err)
		}
	})
}

module.exports = {
	checkCookies,
	setCookie,
	updateCookie,
	deleteCookie
	}