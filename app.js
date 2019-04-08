var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "media_catalog";

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


app.get("/api/medias", async function (req, res) {

  var limit = parseInt(req.query.limit);
  var next = req.query.next;
  var q = req.query.q;
  var dbFilter = {};
  
  if (q) {
    dbFilter["$text"] = { $search: q };
  }

  var countQuery = await db.collection(CONTACTS_COLLECTION).find(dbFilter).count();

  if (next) {
    dbFilter = {
      _id: { $lt: ObjectID(next) }
    }
  }

  db.collection(CONTACTS_COLLECTION).find(dbFilter).sort({
    _id: -1
  }).limit(limit).toArray(function (err, items) {
    if (err) {
      handleError(res, err.message, "Failed to get media.");
    } else {
      const next = items[items.length - 1] && items[items.length - 1]._id
      var totalCount = countQuery;
      res.status(200).json({ items, next, totalCount });
    }
  });
});

app.post("/api/medias", function (req, res) {
});

/*  "/api/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/api/medias/:id", function (req, res) {
});

app.put("/api/medias/:id", function (req, res) {
});

app.delete("/api/medias/:id", function (req, res) {
});