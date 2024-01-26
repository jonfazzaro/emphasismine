module.exports = async function (context) {
    const trello = require("./trello")(context);
    const metadata = require("./openGraph");
    const tumblr = require("./tumblr");

    const card = await trello.getNextCard();
    if (card) {
        if (!isReadReminder(card))
            await postFrom(card);
    } else await remindMeToRead();

    function isReadReminder(card) {
        return card.name === readReminder;
    }

    async function remindMeToRead() {
        await trello.createCard(readReminder, null, null,
            [
                trello.labels.deep
            ]);
    }

    async function postFrom(card) {
        card.url = attachedUrl(card);
        if (!card.url)
            return

        await tumblr.post(await linkPost(card));
        await trello.archive(card);
    }

    function attachedUrl(card) {
        return card.attachments[0]?.url || null;
    }

    async function linkPost(card) {
        const meta = await metadata.fetch(card.url);

        return {
            content: [
                {
                    type: "link",
                    url: card.url,
                    title: card.name,
                    ...(!!meta && !!meta.image) && { poster: [{url: meta.image}] }
                },
                {
                    type: "text",
                    text: description(card),
                }
            ],
            tags: tags(card),
        };
    }

    function description(card) {
        return desc(card)
            .replace(hashtagsAtTheEnd, "")
            .replace(hashtags, " $2").trim();
    }

    function tags(card) {
        return [...desc(card).matchAll(hashtags)].map(m => m[2])
    }

    function desc(card) {
        return fixQuotes(unescapeHash(card.desc));
    }

    function unescapeHash(text) {
        return text.replace(/\\#/g, "#");
    }

    // SPIKE
    function fixQuotes(content) {
        return content
            .replace(/[\u201C\u201D]/g, '\"')
            .replace(/[\u2018\u2019]/g, '\'')
    }
};

const hashtags = /(\s|\A)#(\w+)/g;
const hashtagsAtTheEnd = /(\s|\A)#(\w+)($|\s+#\w+)/g;
const readReminder = "Read: something interesting";
