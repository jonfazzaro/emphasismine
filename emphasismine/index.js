const EmphasisMine  = require("./EmphasisMine");

const trello = require("./edge/trello");
const share = require('./edge/share');
const Blogger = require('./Blogger');

module.exports = async function (context) {
    await new EmphasisMine(trello(), new Blogger(), share).run();
};


