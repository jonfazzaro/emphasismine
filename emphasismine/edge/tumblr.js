const tumblr = require("tumblr.js");

module.exports = class TumblrBlog {
    async post (params) {

        const request = {
            ...params,
            state: process.env.postState
        };

        const client = tumblr.createClient({
            consumer_key: process.env.tumblrConsumerKey,
            consumer_secret: process.env.tumblrConsumerSecret,
            token: process.env.tumblrToken,
            token_secret: process.env.tumblrTokenSecret,
        });

        await client.createPost(process.env.tumblrBlogname, request)
    }
}