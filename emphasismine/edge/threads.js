const threads = require('@threadsjs/threads.js')

module.exports = {
    post: async (params) => {

        const client = new threads.Client({
            token: process.env.threadsToken,
            userAgent: process.env.threadsUserAgent,
            appId: process.env.threadsAppId,
            androidId: process.env.threadsAndroidId,
            userId: null,
            base: process.env.threadsBaseUrl
        });

        await client.posts.create(process.env.threadsUserId, {contents: params.content}).then(response => {
            console.log(response);
        });
    }
};