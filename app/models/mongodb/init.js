
//initializes the mongoDB interface for app

var config = require("../../../config/config.json")
var mongoClient = require('mongodb').MongoClient

// mongo database - test connection

function connectionTest(callback) {
	mongoClient.connect(config.mongo_url, function (err, database) {
		if (err) { 
			throw err
		} else {
			callback(false,database)
		}
	})
}

function write(collection_name, data, callback) {
	try {
		connectionTest(function(err,db){
			db.collection(collection_name).save(data, function (err, result) {
				if (err) {
					throw err
				} else {
					callback(false,null)
				}
			})
		})
	}
	catch (err) {
		console.log("db error:", err)
	}
}

function read(collection_name,callback) {
	try {
		connectionTest(function(err,db){
			db.collection(collection_name).find().toArray(function(err, results) {
				if (err) {
					throw err
				} else {
					callback(false,results)
				}
			})
		})
	}
	catch (err) {
		console.log("db error:", err)
	}
}

module.exports = {
	write,
	read
}