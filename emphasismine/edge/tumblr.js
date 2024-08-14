const tumblr = require("tumblr.js");

module.exports = {
    post: async (params) => {

        const request = {
            ...params,
            state: process.env.postState
        };

        if (process.env.tumblr === 'false') {
            console.log(request)
            return Promise.resolve();
        }

        const client = tumblr.createClient({
            consumer_key: process.env.tumblrConsumerKey,
            consumer_secret: process.env.tumblrConsumerSecret,
            token: process.env.tumblrToken,
            token_secret: process.env.tumblrTokenSecret,
        });

        await client.createPost(process.env.tumblrBlogname, request)
    }
};