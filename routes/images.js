var express = require('express');
var router = express.Router();
const sharp = require('sharp');
const got = require('got');

router.get("/roku", async function (req, res) {
    try {
        const h = parseInt(req.query.h);
        const u = req.query.u;
        const rawBuffer = await got(u, {
            responseType: 'buffer'
        });
        const pngBuffer = await sharp(rawBuffer.body).resize(h).png().toBuffer();
        res.type('png');
        res.end(pngBuffer);
    } catch (error) {
        console.log(error);
        console.log('Unable to resolve given image');
        res.send('Unable to resolve given image');
    }
});

module.exports = router;
