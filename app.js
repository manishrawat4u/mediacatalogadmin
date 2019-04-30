var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + "/dist";
app.use(express.static(distDir));

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://media_catalog_user:test_123@ds145245.mlab.com:45245/appharbor_thwfllgj", function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();
  console.log("Database connection ready");

  app.locals.db = db;  
  // Initialize the app.
  var server = app.listen(process.env.PORT || 4000, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({ "error": message });
}


async function delay(ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}


var medias = require('./routes/medias');

var imdb = require('./routes/imdb');

var playlist = require('./routes/playlist');

app.use('/api/medias', medias);
app.use('/api/imdb', imdb);
app.use('/api/playlist', playlist);