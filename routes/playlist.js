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
var nurlresolver = require('nurlresolver');
var logger = require('../services/logging');
const daddyliveCrawler = require('./../services/crawlers/daddylive');
const playlistService = require('./../services/playlistService');
const channelLogoService =require('./../services/channelLogoService');
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
        "id": "hdhub4u",
        "displayName": "HDHub4u",
        "playlistType": "auto"
    }, {
        "id": "extramovies",
        "displayName": "ExtraMovies",
        "playlistType": "auto"
    }, {
        "id": "livecricket",
        "displayName": "Live Cricket (Reddit)",
        "playlistType": "auto"
    }, {
        "id": "daddylive",
        "displayName": "Daddylive",
        "playlistType": "auto"
    }];
    res.send(dataToReturn || [], null, 4);
});

router.get('/mediasource/byimdb/:imdbid', async function (req, res) {
    var db = req.app.locals.db;
    var imdbid = req.params.imdbid;
    var response = {};
    try {

        if (imdbid) {
            var dbFilter = {
                "imdbInfo.id": imdbid
            };
            var dbresponse = await db.collection(MEDIA_COLLECTION).find(dbFilter)
                .sort({ "media_document.modifiedTime": -1 }).toArray();

            var imdbTitle = dbresponse[0].imdbInfo.title;
            logger.logEvent('Application Logs', 'MediaSource', imdbTitle, imdbid);

            const streamUrls = dbresponse.map(x => x.media_document.webViewLink);
            const mediaSources = await playlistService.generateItems(streamUrls);
            response.success = true;
            response.items = mediaSources;
        } else {
            response.success = false;
            response.items = [];
        }
    } catch (error) {
        response.success = false;
        response.items = [];
    }
    res.send(response, null, 4);
});

router.get('/mediasource', async function (req, res) {
    var u = req.query.u;
    var response = {};
    try {
        logger.logEvent('Application Logs', 'MediaSource', 'IPL', 'IPL');
        const mediaSources = await playlistService.generateItems([u]);
        response.success = true;
        response.items = mediaSources;
    } catch (error) {
        response.success = false;
        response.items = [];
    }
    res.send(response, null, 4);
});

router.get('/livecricket', async function (req, res) {
    const response = {};
    try {
        var imdbInfo = {};
        imdbInfo.id = "tt8710622";
        imdbInfo.plot = "IPL";
        imdbInfo.poster = "https://m.media-amazon.com/images/M/MV5BNzExOTdiZGQtNDc1OS00NTNhLWEyNDctMjU1MDRhZGQ1NmE2XkEyXkFqcGdeQXVyODAzNzAwOTU@._V1_QL50.jpg";
        imdbInfo.title = 'IPL';
        imdbInfo.year = "2020";
        var mediaSourceUrl = `/api/playlist/mediasource/cricccipl`;
        var existingElement = {
            imdbInfo,
            mediaSourceUrl
        }
        massageImdbPoster(existingElement);
        response.success = true;
        response.items = [existingElement];
    } catch (error) {
        response.success = false;
        response.items = [];
    }
    res.send(response, null, 4);
});

router.get('/daddylive', async function (req, res) {
    const response = {};
    try {
        const results = await daddyliveCrawler.extractLinks();
        const mappedItems = results.map((x) => {
            //need a better way to display channels like imdbinfo is not necessary for that, but it will break the app contract.
            var imdbInfo = {};
            imdbInfo.id = "";
            imdbInfo.plot = x.channelName;
            imdbInfo.poster = channelLogoService.getChannelLogo(x.channelName),
            imdbInfo.title = x.channelName;
            imdbInfo.year = "";
            var mediaSourceUrl = `/api/playlist/mediasource?u=${encodeURIComponent(x.link)}`;
            var existingElement = {
                imdbInfo,
                mediaSourceUrl
            }
            massageImdbPoster(existingElement);
            return existingElement;
        });
        response.success = true;
        response.items = mappedItems;
    } catch (error) {
        response.success = false;
        response.items = [];
    }
    res.send(response, null, 4);
});


router.get('/mediasource/cricccipl', async function (req, res) {
    const iplstreams = ['http://www.cric8.cc/ipl2.php', 'http://www.cric8.cc/ipl2.php'];
    var response = {};
    try {
        logger.logEvent('Application Logs', 'MediaSource', 'IPL', 'IPL');
        const mediaSources = await playlistService.generateItems(iplstreams);
        response.success = true;
        response.items = mediaSources;
    } catch (error) {
        response.success = false;
        response.items = [];
    }
    res.send(response, null, 4);
})

router.get('/:paylistId', async function (req, res) {
    var db = req.app.locals.db;
    var playlistId = req.params.paylistId;

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
        case "hdhub4u":
            dbFilter = {
                "imdbInfo": { $ne: null },
                "source": "hdhub"
            }
            break;
        case "extramovies":
            dbFilter = {
                "imdbInfo": { $ne: null },
                "source": "extramovies"
            }
            break;
        default:
            dbFilter = {
                "imdbInfo": { $ne: null },
                "playlistId": playlistId
            }
            break;
    }


    db.collection(MEDIA_COLLECTION).find(dbFilter).sort({ "media_document.modifiedTime": -1 }).toArray(function (err, doc) {
        var g = [];
        doc.forEach(element => {
            var imdbInfo = element.imdbInfo;
            var mediaInfo = element.media_document;

            //hacky way
            if (element.source === 'hdhub' || element.source === 'extramovies') {
                var existingElement = g.find(x => x.imdbInfo.id === imdbInfo.id);
                if (!existingElement) {
                    //imdbInfo.posterThumb = `/api/images/roku?u=${encodeURIComponent(imdbInfo.poster)}&h=268`;;
                    var mediaSourceUrl = `/api/playlist/mediasource/byimdb/${encodeURIComponent(imdbInfo.id)}`;
                    existingElement = {
                        imdbInfo,
                        mediaSourceUrl
                    }
                    massageImdbPoster(existingElement);
                    g.push(existingElement);
                }
            } else {
                var existingElement = g.find(x => x.imdbInfo.id === imdbInfo.id);
                if (!existingElement) {
                    existingElement = {
                        imdbInfo: imdbInfo,
                        mediaSources: []
                    }
                    massageImdbPoster(existingElement);
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
            }
        });

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

function massageImdbPoster(mediaItem) {
    //if poster is from amazon
    if (mediaItem.imdbInfo.poster.indexOf('blogspot.com') >= 0) {
        mediaItem.imdbInfo.posterThumb = mediaItem.imdbInfo.poster.replace('s200', 's182')
        mediaItem.imdbInfo.posterHD = mediaItem.imdbInfo.poster.replace('s200', 's776');
        mediaItem.imdbInfo.posterFHD = mediaItem.imdbInfo.poster.replace('s200', 's1552');
    }
    else if (mediaItem.imdbInfo.poster.indexOf('amazon.com') >= 0) {
        var basePoster = mediaItem.imdbInfo.poster.substring(0, (mediaItem.imdbInfo.poster.indexOf('.', 30)));
        mediaItem.imdbInfo.posterThumb = basePoster + "._V1_UX182_CR0,0,182,268_AL_.jpg";
        mediaItem.imdbInfo.posterHD = basePoster + "._V1_UX776_CR0,0,776,1024_AL_.jpg";
        mediaItem.imdbInfo.posterFHD = basePoster + "._V1_UX1552_CR0,0,1552,2048_AL_.jpg";
    }
    else {
        //need to change it to something better
        mediaItem.imdbInfo.posterThumb = mediaItem.imdbInfo.poster;
        mediaItem.imdbInfo.posterHD = mediaItem.imdbInfo.poster;
        mediaItem.imdbInfo.posterFHD = mediaItem.imdbInfo.poster;
    }
}

module.exports = router;

