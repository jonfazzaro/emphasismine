const threads = require('@threadsjs/threads.js')

module.exports = {
    post: async (params) => {

        const client = new threads.Client();
        await client.login(
            process.env.threadsUsername,
            process.env.threadsPassword
        )

        await client.posts.create(process.env.threadsUserId, {contents: params.content})
            .catch(e => console.log(e))
    }
};