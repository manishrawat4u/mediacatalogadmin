var express = require('express');
var router = express.Router();
const got = require('got');

router.get("/proxy", async function (req, res) {
    try {
        const u = req.query.u;
        console.log(u);
        const m3u8Response = await got(u);
        const m3u8ResponseBody = m3u8Response.body;
        let transformedM3u8Response = '';
        const lineItems = [];
        for (const line of m3u8ResponseBody.split('\n')) {
            if (line.endsWith('.ts')) {
                const url = new URL(line, u);
                lineItems.push(url.href);
            } else {
                lineItems.push(line);
            }
            transformedM3u8Response = lineItems.join('\n');
        }
        res.setHeader('content-type', m3u8Response.headers['content-type']);
        res.send(transformedM3u8Response);
    } catch (error) {
        console.log(error);
        console.log('Unable to proxy the m3u8');
        res.send('Unable to proxy the m3u8');
    }
});

module.exports = router;
