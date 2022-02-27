const tumblr = require("tumblr.js");

module.exports = { 
    post: (options) => {
        const fn = {
            "text": "createTextPost",
            "link": "createLinkPost",
        }[options.type];
        return call(fn, { 
            ...options, state: 
            process.env.postState
        });
    }
};

const client = tumblr.createClient({
  consumer_key: process.env.tumblrConsumerKey,
  consumer_secret: process.env.tumblrConsumerSecret,
  token: process.env.tumblrToken,
  token_secret: process.env.tumblrTokenSecret,
});

function call(method, options) {
    return new Promise((resolve, reject) => {
        client[method](process.env.tumblrBlogname, options, (e, data) => {
            if (e) reject(e);
            resolve(data);
        })
    });
}