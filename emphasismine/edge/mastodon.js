const axios = require('axios');

const MASTODON_SERVER = process.env.mastodonUrl
const MASTODON_TOKEN = process.env.mastodonToken

module.exports = {
    post: async (params) => {
        if (process.env.debug === 'true')
            return

        await axios.post(`https://${MASTODON_SERVER}/api/v1/statuses`, JSON.stringify({
            status: status(params)
        }), {
            headers: {
                "content-type": "application/json",
                "Authorization": `Bearer ${MASTODON_TOKEN}`
            }
        })
    }
}

function status(params) {
    return `${params.text}\n\n${(tags(params))}\n\n${params.link}`;
}

function tags(params) {
    return params.tags
        .split(',')
        .map(t => `#${t}`)
        .filter(t => t !== '#in')
        .join(' ');
}
