module.exports = async function (context, debug = false) {
    const trello = require("./edge/trello")(context);
    const metadata = require("./edge/openGraph");
    const tumblr = require("./edge/tumblr");
    const share = require('./edge/share')

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
        await share.post({
            link: card.url,
            text: description(card),
            tags: tags(card).join(','),
            ...(!!debug) && { debug: true }
        })

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
                    ...(isMetaImageValid(meta)) && { poster: [{url: meta.image}] }
                },
                {
                    type: "text",
                    text: description(card),
                }
            ],
            tags: tags(card),
        };

    }

    function isMetaImageValid(meta) {
        return !!meta
            && !!meta.image
            && meta.image.startsWith("http")
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
