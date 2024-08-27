const metadata = require("./edge/openGraph");
const tumblr = require("./edge/tumblr");
const cardParser = require('./cardParser');

module.exports = {
    post: async function(card, date = null) {
        await tumblr.post(await linkPost(card, date));
    }
};

async function linkPost(card, date) {
    const meta = await metadata.fetch(card.url);

    return {
        ...date && {date},
        content: [
            {
                type: "link",
                url: card.url,
                title: card.name,
                ...(isMetaImageValid(meta)) && { poster: [{url: meta.image}] }
            },
            {
                type: "text",
                text: cardParser.description(card),
            }
        ],
        tags: cardParser.tags(card),
    };
}

function isMetaImageValid(meta) {
    return !!meta
        && !!meta.image
        && meta.image.startsWith("http")
}
