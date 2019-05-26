var express = require('express');
var router = express.Router();
var MEDIA_COLLECTION = "media_catalog";
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

router.get("/", async function (req, res) {
    var dataToReturn = [{
        "id": "4k",
        "displayName": "4k Movies",
        "playlistType": "auto"
    }, {
        "id": "fhd",
        "displayName": "Full HD Movies (1080p)",
        "playlistType": "auto"
    }, {
        "id": "hd",
        "displayName": "HD Movies (720p)",
        "playlistType": "auto"
    }];
    res.send(dataToReturn || [], null, 4);
});

router.get('/:paylistId', async function (req, res) {
    var db = req.app.locals.db;
    var playlistId = req.params.paylistId;

    if (playlistId === "4k") {
        dbFilter = {
            "imdbInfo": { $ne: null },
            "media_document.videoMediaMetadata.width": { $gt: 3000 }
        }
    }

    switch (playlistId) {
        case "4k":
            dbFilter = {
                "imdbInfo": { $ne: null },
                "media_document.videoMediaMetadata.width": { $gt: 3000 }
            }
            break;
        case "fhd":
            dbFilter = {
                "imdbInfo": { $ne: null },
                "media_document.videoMediaMetadata.width": { $gt: 1800, $lt: 3000 }
            }
            break;
        case "hd":
            dbFilter = {
                "imdbInfo": { $ne: null },
                "media_document.videoMediaMetadata.width": { $gt: 1200, $lt: 1800 }
            }
            break;
        default:
            dbFilter = {
                "imdbInfo": { $ne: null },
                "playlistId": playlistId
            }
            break;
    }


    db.collection(MEDIA_COLLECTION).find(dbFilter).toArray(function (err, doc) {
        var g = [];
        doc.forEach(element => {
            var imdbInfo = element.imdbInfo;
            var mediaInfo = element.media_document;
            var existingElement = g.find(x => x.imdbInfo.id === imdbInfo.id);

            if (!existingElement) {
                existingElement = {
                    imdbInfo: imdbInfo,
                    mediaSources: []
                }
                g.push(existingElement);
            }

            var mediaSource = {
                id: mediaInfo.id,
                source: element.source,
                mimeType: mediaInfo.mimeType,
                size: mediaInfo.size,
                videoMediaMetadata: mediaInfo.videoMediaMetadata
            };
            existingElement.mediaSources.push(mediaSource);
        });

        // var itemsToReturn = doc.map(element => {
        //     element.source
        //     element.imdbInfo.id,
        //         element.imdbInfo.title,
        //         element.imdbInfo.plot,
        //         element.imdbInfo.year,
        //         element.imdbInfo.poster,
        //         element.media_document.id,
        //         element.media_document.mimeType,
        //         element.media_document.size,
        //         element.media_document.videoMediaMetadata.width,
        //         element.media_document.videoMediaMetadata.height,
        //         element.media_document.videoMediaMetadata.durationMillis
        // });

        var response = {};
        if (g) {
            response.success = true;
            response.items = g;
        }
        else {
            response.success = false;
            response.items = null;
        }
        res.send(response || [], null, 4);
    });
});

module.exports = router;

