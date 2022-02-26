module.exports = async function (context) {
  const trello = require("./trello")(context);
  const tumblr = require("./tumblr");

  const card = await trello.getNextCard();
  if (!card) return;

  // const url = card.attachments[0]?.url || null;

  await tumblr.post(textPost(card));
};

function textPost(card) {
  return {
    title: card.name,
    description: description(card),
    url: null,
    type: "text",
    tags: tags(card).join(",")
  };
}

function description(card) {
    return card.desc.replace(hashtags, "").trim();
}

function tags(card) {
    return ["emphasismine"].concat(
        [...card.desc.matchAll(hashtags)].map(m => m[2]));
}

const hashtags = /(\s|\A)#(\w+)/g;