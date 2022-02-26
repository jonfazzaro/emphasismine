
module.exports = async function (context) {
    const trello = require("./trello")(context);
    const tumblr = require("./tumblr");
    
    const card = await trello.getNextCard();
    if (!card)
        return; 

    await tumblr.post({title: card.name});

};