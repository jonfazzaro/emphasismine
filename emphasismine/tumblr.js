const tumblr = require("tumblr.js");

module.exports = { 
    edit: (options) => call(client.editPost, options),
    post: (options) => call(client.createLinkPost, options)
};

const client = tumblr.createClient({
  consumer_key: process.env.tumblrConsumerKey,
  consumer_secret: process.env.tumblrConsumerSecret,
  token: process.env.tumblrToken,
  token_secret: process.env.tumblrTokenSecret,
});

function call(method, options) {
    return new Promise((resolve, reject) => {
        method(process.env.blogname, options, (e, data) => {
            if (e) reject(e);
            resolve(data);
        })
    });
}