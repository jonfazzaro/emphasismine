module.exports = async function (context) {
  const trello = require("./trello")(context);
  const metadata = require("./openGraph");
  const tumblr = require("./tumblr");

  const card = await trello.getNextCard();
  if (card) {
    if (!isReadReminder(card)) 
      await postFrom(card);
  }
  else await remindMeToRead();

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
    const method = !!card.url ? linkPost : textPost;
    await tumblr.post(await method(card));
    await trello.archive(card);
  }

  function attachedUrl(card) {
    return card.attachments[0]?.url || null;
  }

  async function linkPost(card) {
    const meta = await metadata.fetch(card.url);
    return {
      title: card.name,
      description: description(card),
      url: card.url,
      type: "link",
      tags: tags(card).join(","),
      thumbnail: meta.image,
    };
  }

  function textPost(card) {
    return {
      title: card.name,
      body: description(card),
      url: null,
      type: "text",
      tags: tags(card).join(","),
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
    return unescapeHash(card.desc);
  }

  function unescapeHash(text) {
    return text.replace(/\\#/g, "#");
  }
};


const hashtags = /(\s|\A)#(\w+)/g;
const hashtagsAtTheEnd = /(\s|\A)#(\w+)($|\s+#\w+)/g;
const readReminder = "Read: something interesting";
