
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
	//inserts data = {key:value} into collection_name
	try {
		connectionTest(function(err,db){
			db.collection(collection_name).insertOne(data, function (err, result) {
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

function read(collection_name, criteria, callback) {
	// will match all criteria {key:value} in collection_name
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

function update(collection_name, criteria, update, callback) {
	// will find all criteria {key:value} in collection_name and perform update functions
	try {
		connectionTest(function(err,db){
			db.collection(collection_name).findOneAndUpdate(criteria, update, function(err, results) {
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

function remove(collection_name, criteria, callback) {
	// will find all criteria {key:value} in collection_name and remove the record
	try {
		connectionTest(function(err,db){
			db.collection(collection_name).findOneAndDelete(criteria, function(err, results) {
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
	read,
	update,
	remove
}