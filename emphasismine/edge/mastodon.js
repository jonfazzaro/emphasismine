const axios = require('axios');

module.exports = {
    post,
    get,
    status
}

async function post(params) {
    if (process.env.debug === 'true') return

    await axios.post(`https://${MASTODON_SERVER}/api/v1/statuses`, JSON.stringify({
        status: status(params)
    }), {
        headers
    })
}

function status(params) {
    return `${params.text}\n\n${(hash(params.tags))}${params.link}`;
}

function hash(tags) {
    if (!tags.trim()) return '';

    return tags
            .split(',')
            .filter((t) => t !== "in")
            .map((t) => '#' + t.replace(/\s/g, ''))
            .join(' ') +
        "\n\n";
}

async function get(path = `api/v1/statuses`) {
    return await axios.get(`https://${MASTODON_SERVER}/${path}`, {
        headers
    })
}

const MASTODON_SERVER = process.env.mastodonUrl

const MASTODON_TOKEN = process.env.mastodonToken

const headers = {
    "content-type": "application/json",
    "Authorization": `Bearer ${MASTODON_TOKEN}`
};
