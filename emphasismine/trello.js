const fetch = require("node-fetch");

function trello(context) {
    return { createCard, getCards, archiveCard }

    async function createCard(name, desc, due) {
        return await fetch("https://api.trello.com/1/cards", {
            headers: headers(),
            method: "POST",
            body: JSON.stringify({
                idList: process.env.trelloListID,
                name: name,
                desc: desc,
                due: due
            })
        }).catch(err => context.log(err));
    }

    async function archiveCard(cardId) {
        return await fetch(`https://api.trello.com/1/cards/${cardId}`, {
            headers: headers(),
            method: "PUT",
            body: JSON.stringify({
                closed: true
            })
        }).catch(err => context.log(err));
    }

    async function getCards() {
        return await fetch(`https://api.trello.com/1/lists/${process.env.trelloListID}/cards`, {
            headers: headers(),
            method: "GET"
        }).catch(err => context.log(err));
    }

    function headers() {
        return { 
            "Authorization": `OAuth oauth_consumer_key=\"${process.env.trelloKey}\", oauth_token=\"${process.env.trelloToken}\"`,
            "Content-Type": "application/json" 
        };
    }

};

module.exports = trello;