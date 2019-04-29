var express = require('express');
var router = express.Router();
var CONTACTS_COLLECTION = "media_catalog";
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

const IMDBScraper = require('imdb-scrapper/index')


router.get("/", async function (req, res) {
  var db = req.app.locals.db;

  var pageNo = parseInt(req.query.next)
  var limit = parseInt(req.query.limit);
  if (pageNo < 0 || pageNo === 0) {
    response = { "error": true, "message": "invalid page number, should start with 1" };
    return res.json(response)
  }
  var skip = limit * (pageNo - 1)

  var q = req.query.q;
  var dbFilter = {};

  if (q) {
    dbFilter["$text"] = { $search: q };
  }

  var countQuery = await db.collection(CONTACTS_COLLECTION).find(dbFilter).count();

  db.collection(CONTACTS_COLLECTION).find(dbFilter).skip(skip).limit(limit).toArray(function (err, items) {
    if (err) {
      handleError(res, err.message, "Failed to get media.");
    } else {
      var totalCount = countQuery;
      res.status(200).json({ items, pageNo, totalCount });
    }
  });
});

router.post('/:mediaId/imdb', async function (req, res) {
  var db = req.app.locals.db;
  var imdbId = req.body.imdbId;
  var mediaId = req.params.mediaId;
  var result = await IMDBScraper.scrapper(imdbId);

  var imdbObject = {
    id: imdbId,
    title: result.title,
    plot: result.story,
    year: result.year,
    poster: result.poster
  }

  db.collection(CONTACTS_COLLECTION).updateOne({ _id: ObjectID(mediaId) }, { $set: { imdbInfo: imdbObject } }, function (err, doc) {
    var response = {};

    if (err) {
      response.success = false;
    }
    else {
      response.success = true;
    }
    res.send(response);
  });
});

// app.post("/api/medias", function (req, res) {
// });

/*  "/api/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

// app.get("/api/medias/:id", function (req, res) {
// });

// app.put("/api/medias/:id", function (req, res) {
// });

// app.delete("/api/medias/:id", function (req, res) {
// });

module.exports = router;

