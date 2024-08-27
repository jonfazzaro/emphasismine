const trello = require("./edge/trello");
const share = require('./edge/share');
const cards = require('./cards');
const blog = require('./blog');

const readReminder = "Read: something interesting";

module.exports = async function (context) {
    const trelloClient = trello(context);

    if (context.asLibrary)
        return { postToBlog }

    const card = await trelloClient.getNextCard();
    if (card) {
        if (!isReadReminder(card))
            await post(card);
    } else await remindMeToRead();

    function isReadReminder(card) {
        return card.name === readReminder;
    }

    async function remindMeToRead() {
        await trelloClient.createCard(readReminder, null, null, [trelloClient.labels.deep]);
    }

    async function post(card) {
        const url = cards.attachedUrl(card);
        if (!url)
            return

        await postToBlog(card);
        await share.post({
            link: url,
            text: cards.description(card),
            tags: cards.tags(card).join(','),
            ...isDebug() && { debug: true }
        })

        await trelloClient.archive(card);
    }

    async function postToBlog(card, date = null) {
        await blog.post(from(card), date);
    }

    function from(card) {
        return {
            url: cards.attachedUrl(card),
            title: card.name,
            description: cards.description(card),
            tags: cards.tags(card)
        };
    }

    function isDebug() {
        return process.env.debug === 'true';
    }
};
