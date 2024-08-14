const _ = require("dotenv").config();
const fn = require("./emphasismine/index");
const mastodon = require("./emphasismine/edge/mastodon");
const he = require('he')

main();

async function main() {
    const em = await fn({asLibrary: true, log: console.log});

    const path = `api/v2/search?type=statuses&q=http&account_id=109310850318765086&min_id=112512691150562813&max_id=112958845915345773`
    const response = await mastodon.get(path);

    const posts = response.data.statuses.filter(s => !!s.card).map(status => ({
        name: status.card.title,
        desc: content(status.content),
        tags: status.tags.map(t => t.name),
        url: status.card.url,
        date: status.created_at
    }));

    function content(content) {
        const firstParagraph = content.split("</p>")[0].replace(/^<p>/, '');
        return he.decode(firstParagraph);
    }

    posts.map(async post => {
        console.log(post)
        await em.postToBlog(post, post.date)
    })
}

