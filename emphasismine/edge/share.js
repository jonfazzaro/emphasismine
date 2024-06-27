const axios = require('axios');
const mastodon = require("./mastodon");

module.exports = {
    post: async (params) => {
        await axios.post(`https://maker.ifttt.com/trigger/link_shared/json/with/key/${process.env.iftttKey}`, params, {
            headers: {
                "content-type": "application/json",
            },
        });

        await mastodon.post(params)
    }
}
