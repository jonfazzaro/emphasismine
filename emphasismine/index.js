const trello = require("./edge/trello");
const metadata = require("./edge/openGraph");
const tumblr = require("./edge/tumblr");
const share = require('./edge/share');
const cardParser = require('./cardParser');

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
        await tumblr.post(await linkPost(card, date));
    }

    async function postFrom(card) {
        card.url = cardParser.attachedUrl(card);
        if (!card.url)
            return

        await postToBlog(card);
        await share.post({
            link: card.url,
            text: cardParser.description(card),
            tags: cardParser.tags(card).join(','),
            ...isDebug() && { debug: true }
        })

        await trelloClient.archive(card);
    }

    function isDebug() {
        return process.env.debug === 'true';
    }

    async function linkPost(card, date) {
        const meta = await metadata.fetch(card.url);

        return {
            ...date && {date},
            content: [
                {
                    type: "link",
                    url: card.url,
                    title: card.name,
                    ...(isMetaImageValid(meta)) && { poster: [{url: meta.image}] }
                },
                {
                    type: "text",
                    text: cardParser.description(card),
                }
            ],
            tags: cardParser.tags(card),
        };
    }

    function isMetaImageValid(meta) {
        return !!meta
            && !!meta.image
            && meta.image.startsWith("http")
    }
};
