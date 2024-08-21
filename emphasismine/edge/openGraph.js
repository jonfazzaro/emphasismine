const cheerio = require("cheerio");

module.exports = { fetch: fetchMetadata };

async function fetchMetadata(url) {
  const response = await fetch(url)
  const html = await response.text()
  return parse(html, url)
}

function parse(html, url) {
  if (!html)
    return {
      url
    };

  const $ = cheerio.load(html);
  return {
    url: og($, "url") || url,
    title: og($, "title") || $("head title").text(),
    description: og($, "description"),
    image: og($, "image"),
  };
}

function og($, property) {
  return $(`meta[property=og:${property}]`).attr("content");
}
