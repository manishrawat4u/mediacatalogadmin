var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");

var startUpProcessor = require('./services/startup');

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + "/dist";

app.use((req, res, next) => {
  const startHrTime = process.hrtime();
  const userIp = req.ip;  
  console.log('user ip:', userIp);
  logger.logPageView(req.path, '', req.host, userIp);
  res.on("finish", () => {
    const elapsedHrTime = process.hrtime(startHrTime);
    const elapsedTimeInMs = elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;
    logger.logPageTiming(req.path, elapsedTimeInMs, userIp);
  });

  next();
});

app.use(express.static(distDir));

var logger = require('./services/logging');

logger.log('Application starting up');

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, client) {
  if (err) {
    logger.logError(err);
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
    startUpProcessor.process(db);
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
var images = require('./routes/images');
var crawler = require('./routes/crawler');

app.use('/api/medias', medias);
app.use('/api/imdb', imdb);
app.use('/api/playlist', playlist);
app.use('/api/images', images);
app.use('/api/crawler', crawler);