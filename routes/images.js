var express = require('express');
var router = express.Router();
const sharp = require('sharp');
const got = require('got');

router.get("/roku", async function (req, res) {
    try {
        var h = parseInt(req.query.h);
        var u = req.query.u;
        const rawBuffer = await got(u, {
            responseType: 'buffer'
        });
        const bfff = await sharp(rawBuffer.body).resize(h).png().toBuffer();
        res.sendRaw(bfff);
    } catch (error) {
        console.log(error);
        console.log('Unable to resolve given image');
        res.send('Unable to resolve given image');
    }
});

module.exports = router;
