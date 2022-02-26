module.exports = async function (context) {
  const trello = require("./trello")(context);
  const tumblr = require("./tumblr");

  const card = await trello.getNextCard();
  if (!card) return;

  card.url = card.attachments[0]?.url || null;
  const createPost = card.url ? linkPost : textPost;
  await tumblr.post(createPost(card));
};

function linkPost(card) {
  return {
    title: card.name,
    description: description(card),
    url: card.url,
    type: "link",
    tags: tags(card).join(","),
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

const hashtags = /(\s|\A)#(\w+)/g;
