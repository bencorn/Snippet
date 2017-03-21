
//routes is the controller for the app, defining the routing for the website


//initialize mongoDB read & push
var db = require('../models/mongodb')


function initapp (app) {
	app.get('/', getHome)
	app.get('/test', getTest)
	app.post('/test', postTest)
	app.post('/api/spotify/search', spotifySearch)
}

function spotifySearch(req, res){
console.log(req.body);
     var req_obj = req.body;
     var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
     var spotifyApi = new SpotifyWebApi();

spotifyApi.searchTracks(req_obj.searchQuery)
  .then(function(data) {
    res.json(data.body);
  }, function(err) {
    console.log('FUCK', err);
	res.json('error');
  });

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