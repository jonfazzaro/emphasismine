const threads = require('@threadsjs/threads.js')

module.exports = {
    post: async (params) => {

        const client = new threads.Client({
            token: process.env.threadsToken,
            userAgent: process.env.threadsUserAgent,
            appId: process.env.threadsAppId,
        });

        if (process.env.debug === 'true')
            return

        await client.posts.create(process.env.threadsUserId, {contents: params.content})
            .catch(e => console.log(e))
    }
};