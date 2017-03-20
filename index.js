var app = require('./app')
var port = process.env.PORT || 8080

// spinning up server
var server = app.listen(port, function () {
	var host = server.address().address;
	console.log("app listening at http://%s:%s", host, port)
})