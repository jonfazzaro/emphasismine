module.exports = async function (context) {
  const trello = require("./trello")(context);
  const metadata = require("./openGraph");
  const tumblr = require("./tumblr");

  const card = await trello.getNextCard();
  if (card) await postFrom(card);
  else await remindMeToRead();

  async function remindMeToRead() {
    await trello.createCard("Read: something interesting");
  }

  async function postFrom(card) {
    card.url = card.attachments[0]?.url || null;
    const createPost = card.url ? linkPost : textPost;
    await tumblr.post(await createPost(card));
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
      description: description(card),
      url: null,
      type: "text",
      tags: tags(card).join(","),
    };
  }

  function description(card) {
    return card.desc.replace(hashtags, "").trim();
  }

  function tags(card) {
    return ["emphasismine"].concat(
      [...card.desc.matchAll(hashtags)].map(m => m[2])
    );
  }
};

const hashtags = /(\s|\A)#(\w+)/g;
