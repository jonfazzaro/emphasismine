const cheerio = require("cheerio");
const browser = require("browser");

module.exports = { fetch };

async function fetch(url) {
  return new Promise((resolve, reject) => {
    browser.browse(url, (e, response) => {
      if (e) reject(e);
      resolve(parse(response));
    });
  });
}

function parse(response) {
  const html = response.result;
  if (!html)
    return {
      url: response.url
    };

  const $ = cheerio.load(html);
  return {
    url: og($, "url") || response.url,
    title: og($, "title") || $("head title").text(),
    description: og($, "description"),
    image: og($, "image"),
  };
}

function og($, property) {
  return $(`meta[property=og:${property}]`).attr("content");
}
