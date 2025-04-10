const share = require('./edge/share');
const cards = require('./cards');
const Blogger = require('./Blogger');
const trello = require("./edge/trello");

const readReminder = "Read: something interesting";

module.exports = class EmphasisMine {
    constructor(trelloClient = trello(), blogger = new Blogger(), share = share) {
        this.trelloClient = trelloClient;
        this.blogger = blogger;
        this.share = share;
    }

    async run() {
        const card = await this.trelloClient.getNextCard();
        if (card) {
            if (!this.isReadReminder(card))
                await this.post(card);
        } else await this.remindMeToRead();
    }

    isReadReminder(card) {
        return card.name === readReminder;
    }

    async remindMeToRead() {
        await this.trelloClient.createCard(readReminder, null, null, [this.trelloClient.labels.deep]);
    }

    async post(card) {
        const url = cards.attachedUrl(card);
        if (!url)
            return

        await this.postToBlog(card);
        await share.post({
            link: url,
            text: cards.description(card),
            tags: cards.tags(card).join(','),
            ...this.isDebug() && {debug: true}
        })

        await this.trelloClient.archive(card);
    }

    async postToBlog(card, date = null) {
        await this.blogger.post(this.from(card), date);
    }

    from(card) {
        return {
            url: cards.attachedUrl(card),
            title: card.name,
            description: cards.description(card),
            tags: cards.tags(card)
        };
    }

    isDebug() {
        return process.env.debug === 'true';
    }
}