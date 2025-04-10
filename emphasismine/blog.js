const metadata = require("./edge/openGraph");
const TumblrBlog = require("./edge/TumblrBlog");

module.exports = class Blogger {
    constructor(blog = new TumblrBlog()) {
        this.blog = blog
    }
    
    async post(postData, date = null) {
        await this.blog.post(await linkPost(postData, date));
    }
};

async function linkPost(postData, date) {
    const meta = await metadata.fetch(postData.url);

    return {
        ...date && {date},
        content: [
            {
                type: "link",
                url: postData.url,
                title: postData.title,
                ...(isMetaImageValid(meta)) && { poster: [{url: encodeImageUrl(meta.image)}] }
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

function encodeImageUrl(imageUrl) {
    if (imageUrl.includes("%20")) 
        return imageUrl;
    return encodeURI(imageUrl);
}
