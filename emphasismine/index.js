const EmphasisMine  = require("./EmphasisMine");

module.exports = async function (context) {
    await new EmphasisMine().run();
};


