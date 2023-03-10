const fetch = require("node-fetch");

function trello(context) {
  return { createCard, getNextCard, archive, labels };

  async function createCard(name, desc, due, labels) {
    return await post("https://api.trello.com/1/cards", {
      idList: process.env.trelloListID,
      name: name,
      desc: desc,
      due: due,
      idLabels: labels || []
    });
  }

  async function archive(card) {
    const cardId = card?.id;
    return await put(`https://api.trello.com/1/cards/${cardId}`, {
      closed: true,
    });
  }

  async function getAttachments(cardId) {
    return await get(`https://api.trello.com/1/cards/${cardId}/attachments`);
  }

  async function getNextCard() {
    const cards = await get(
      `https://api.trello.com/1/lists/${process.env.trelloListID}/cards`
    );
    if (!cards.length) return null;

    const top = cards[0];
    top.attachments = await getAttachments(top.id);

    return top;
  }

  async function get(url) {
    return await call("GET", url);
  }

  async function post(url, body) {
    return await call("POST", url, body);
  }

  async function put(url, body) {
    return await call("PUT", url, body);
  }

  async function call(method, url, body) {
    const response = await fetch(url, {
      headers: headers(),
      method: method,
      body: body ? JSON.stringify(body) : null,
    }).catch(err => context.log(err));

    return await response.json();
  }

  function headers() {
    return {
      Authorization: `OAuth oauth_consumer_key=\"${process.env.trelloKey}\", oauth_token=\"${process.env.trelloToken}\"`,
      "Content-Type": "application/json",
    };
  }
}

module.exports = trello;

const labels = {
  deep: "63acc9b1b9ec050165b703c2",
  shallow: "63acc9e61aff960147023172",
}
