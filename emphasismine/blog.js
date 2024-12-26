const metadata = require("./edge/openGraph");
const tumblr = require("./edge/tumblr");

module.exports = {
    post: async function(postData, date = null) {
        await tumblr.post(await linkPost(postData, date));
    }
};

async function linkPost(postData, date) {
    const meta = await metadata.fetch(postData.url);
    console.log(meta)

    return {
        ...date && {date},
        content: [
            {
                type: "link",
                url: postData.url,
                title: postData.title,
                ...(isMetaImageValid(meta)) && { poster: [{url: encodeURI(meta.image)}] }
            },
            {
                type: "text",
                text: postData.description,
            }
        ],
        tags: postData.tags,
    };
}

function isMetaImageValid(meta) {
    return !!meta
        && !!meta.image
        && meta.image.startsWith("http")
}
