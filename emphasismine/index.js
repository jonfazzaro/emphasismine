const trello = require("./edge/trello");
const share = require('./edge/share');
const cardParser = require('./cardParser');
const blog = require('./blog');

const readReminder = "Read: something interesting";

module.exports = async function (context) {
    const trelloClient = trello(context);

    if (context.asLibrary)
        return { postToBlog }

    const card = await trelloClient.getNextCard();
    if (card) {
        if (!isReadReminder(card))
            await postFrom(card);
    } else await remindMeToRead();

    function isReadReminder(card) {
        return card.name === readReminder;
    }

    async function remindMeToRead() {
        await trelloClient.createCard(readReminder, null, null, [trelloClient.labels.deep]);
    }

    async function postToBlog(card, date = null) {
        const postData = {
            url: cardParser.attachedUrl(card),
            title: card.name,
            description: cardParser.description(card),
            tags: cardParser.tags(card)
        };
        await blog.post(postData, date);
    }

    async function postFrom(card) {
        const url = cardParser.attachedUrl(card);
        if (!url)
            return

        await postToBlog(card);
        await share.post({
            link: url,
            text: cardParser.description(card),
            tags: cardParser.tags(card).join(','),
            ...isDebug() && { debug: true }
        })

        await trelloClient.archive(card);
    }

    function isDebug() {
        return process.env.debug === 'true';
    }
};
