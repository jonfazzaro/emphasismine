const axios = require('axios');
const threads = require("./threads");

module.exports = {
    post: async (params) => {
        await axios.post(`https://maker.ifttt.com/trigger/link_shared/json/with/key/${process.env.iftttKey}`, params, {
            headers: {
                "content-type": "application/json",
            },
        });

        await threads.post({
            content: `${params.text}\n\n${params.link}`
        })
    }
}
