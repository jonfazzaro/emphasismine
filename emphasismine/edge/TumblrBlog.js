const Tumblr= require("tumblr.js");

module.exports = class TumblrBlog {
    constructor(tumblr = Tumblr) {
        this.tumblr = tumblr 
    }
    
    static createNull() {
        return new TumblrBlog(NullTumblr)
    }
    
    async post (params) {

        const request = {
            ...params,
            state: process.env.postState
        };

        const client = Tumblr.createClient({
            consumer_key: process.env.tumblrConsumerKey,
            consumer_secret: process.env.tumblrConsumerSecret,
            token: process.env.tumblrToken,
            token_secret: process.env.tumblrTokenSecret,
        });

        await client.createPost(process.env.tumblrBlogname, request)
    }
}

class NullTumblr {
    createClient() {
        return {
            async createPost() {}
        }
    }
}