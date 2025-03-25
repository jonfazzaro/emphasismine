const cheerio = require("cheerio");

module.exports = {fetch: fetchMetadata};

async function fetchMetadata(url) {
    const response = await fetch(url)
    const html = await response.text()
    return parse(html, url)
}

async function parse(html, url) {
    if (!html)
        return {
            url
        };

    const $ = cheerio.load(html);
    return {
        url: og($, "url") || url,
        title: og($, "title") || $("head title").text(),
        description: og($, "description"),
        image: await ogImage($),
    };
}

async function ogImage($) {
    const url = og($, "image")
    return await imageIsValid(url) ? url : null
}

async function imageIsValid(url) {
    try {
        const response = await fetch(url)
        return response.headers.get("content-type").startsWith("image/");
    } catch (e) {
        return false;
    }
}

function og($, property) {
    return $(`meta[property=og:${property}]`).attr("content");
}
