
//routes is the controller for the app, defining the routing for the website


//initialize mongoDB read & push
var db = require('../models/mongodb')


function initapp (app) {
	app.get('/', getHome)
	app.get('/test', getTest)
	app.post('/test', postTest)
}

function getHome(req, res) {
	console.log('index page')
	res.render("index.ejs")
}

function getTest(req, res) {
	db.read('test', function(err,results){
		if(!err){
			res.render('test.ejs', {results: results})
		}
	})
}

function postTest(req, res) {
	db.write('test',req.body, function (err,results) {
		if (!err) {
			res.redirect('/')
		}
	})
}

module.exports = initapp