const Tumblr= require("tumblr.js");

module.exports = class TumblrBlog {
    
    get lastPost() {
        return this._lastPost
    }
    
    constructor(tumblr = Tumblr) {
        this._tumblr = tumblr 
        this._lastPost = null
    }
    
    static createNull() {
        return new TumblrBlog(new NullTumblr())
    }
    
    async post (params) {

        const request = {
            ...params,
            state: process.env.postState
        };

        const client = this._tumblr.createClient({
            consumer_key: process.env.tumblrConsumerKey,
            consumer_secret: process.env.tumblrConsumerSecret,
            token: process.env.tumblrToken,
            token_secret: process.env.tumblrTokenSecret,
        });

        await client.createPost(process.env.tumblrBlogname, request)
        this._lastPost = {
            blogName: process.env.tumblrBlogname,
            request
        }
    }
}

class NullTumblr {
    createClient() {
        return {
            async createPost() {}
        }
    }
}