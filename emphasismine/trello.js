const fetch = require("node-fetch");

function trello(context) {
    return {
        createCard: createCard
    }

    async function createCard(name, desc, due) {
        return await fetch("https://api.trello.com/1/cards", {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({
                token: process.env.trelloToken,
                key: process.env.trelloKey,
                idList: process.env.trelloListID,
                name: name,
                desc: desc,
                due: due
            })
        }).catch(err => context.log(err));
    }

};

module.exports = trello;