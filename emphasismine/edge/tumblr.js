const tumblr = require("tumblr.js");

module.exports = {
    post: async (params) => {

        const client = tumblr.createClient({
            consumer_key: process.env.tumblrConsumerKey,
            consumer_secret: process.env.tumblrConsumerSecret,
            token: process.env.tumblrToken,
            token_secret: process.env.tumblrTokenSecret,
        });

        if (process.env.tumblr === 'false')
            return Promise.resolve();

        await client.createPost(process.env.tumblrBlogname, {
            ...params,
            state: process.env.postState
        })
    }
};