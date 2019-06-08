var express = require('express');
var router = express.Router();
var MEDIA_COLLECTION = "media_catalog";
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;
var snoowrap = require('snoowrap');
const axios = require('axios');
const getUrls = require('get-urls');
const voca = require('voca');
const urlunshort = require('url-unshort')();
const url = require('url');

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
    }, {
        "id": "livecricket",
        "displayName": "Live Cricket (Reddit)",
        "playlistType": "auto"
    }];
    res.send(dataToReturn || [], null, 4);
});

router.get('/livecricket', async function (req, res) {
    var objToReturn = {};
    var all = req.query.all;

    const otherRequester = new snoowrap({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36',
        clientId: process.env.redditClientId,
        clientSecret: process.env.redditClientSecret,
        username: process.env.redditUserName,
        password: process.env.redditPassword,
    });

    var dateTill = new Date();
    dateTill.setDate(dateTill.getDate() - 1);

    var subReddit = await otherRequester.getSubreddit('InsectsEnthusiasts').getNew();
    var objImdbs = [];
    for (let index = 0; index < subReddit.length; index++) {
        const element = subReddit[index];
        if (new Date(element.created_utc * 1000) >= dateTill) {
            var imdbInfo = {};
            var allextractedurls = [];
            imdbInfo.id = "tt8710622";
            imdbInfo.plot = "Live Cricket Stream";
            imdbInfo.poster = "https://m.media-amazon.com/images/M/MV5BNzExOTdiZGQtNDc1OS00NTNhLWEyNDctMjU1MDRhZGQ1NmE2XkEyXkFqcGdeQXVyODAzNzAwOTU@._V1_QL50.jpg";
            imdbInfo.title = element.title;
            imdbInfo.year = "2019";

            var commentId = element.id;
            var pushshifturl = `https://api.pushshift.io/reddit/search/comment?sort=asc&link_id=${commentId}&limit=10000`;
            const pushshifturlresposne = await axios.get(pushshifturl);
            var data = pushshifturlresposne.data.data;
            for (let innerIndex = 0; innerIndex < data.length; innerIndex++) {
                const redditcomments = data[innerIndex];
                var extractedUrls = [];
                getUrls(redditcomments.body).forEach(someinput => {
                    extractedUrls.push(someinput);
                });
                for (let innerInnerIndex = 0; innerInnerIndex < extractedUrls.length; innerInnerIndex++) {
                    const extractedUrl = extractedUrls[innerInnerIndex];
                    var normalizedUrl = voca.trim(extractedUrl, ")")
                    if (normalizedUrl.includes("bit.ly")) {
                        normalizedUrl = await urlunshort.expand(normalizedUrl);
                    } else if(normalizedUrl.includes("cric8")){
                        normalizedUrl = "http://cdn1.cric8.cc/live/cric1/index.m3u8"
                    }
                    normalizedUrl && allextractedurls.push(normalizedUrl);
                }
            }
            var finalList = allextractedurls.filter(x => x.endsWith('m3u8') || all);
            var mediaSources = finalList.map(x => {
                var u = url.parse(x);
                return {
                    id: "",
                    streamUrl: x,
                    mimeType: "hls",
                    size: "0",
                    source: u.hostname
                }
            });
            objImdbs.push({
                imdbInfo,
                mediaSources
            })
        }
    }

    var response = {};
    response.success = true;
    response.items = objImdbs;
    res.send(response, null, 4);
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

