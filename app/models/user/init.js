var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = new mongoose.Schema({
	username: {
		type: String,
		required: true,
		index: true
	},
	email: {
		type: String,
		unique: true,
		required: true	
	},
	name: {
		type: String,
		required: true	
	},
	friends:{
		type: Array
	},
	stream:{
		type: Array
	}
});

UserSchema.pre("save", true, function(next, done) {
	var self = this;
	mongoose.models["User"].findOne({email: self.email}, function(err, user) {
		if(err) {
			done(err)
		} else if(user) {
			self.invalidate("email", "email must be unique")
			done(new Error("email must be unique"))
		} else {
			done()
		}
	})
	next()
});

var User = module.exports = mongoose.model('User', UserSchema);

// module.exports.createUser = function(newUser, callback){
// 	// bcrypt.genSalt(10, function(err, salt){
// 	// 	bcrypt.hash(newUser.password, salt, function(err, hash){
// 	// 		newUser.password = hash;
// 	// 		newUser.save(callback);
// 	// 	});
// 	// });
// 	newUser.save(callback)
// }