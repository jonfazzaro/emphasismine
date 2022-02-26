const trello = require("./emphasismine/trello")(console);
const dotenv = require("dotenv");

dotenv.config();
main();

async function main() {

    
    const card = await trello.getNextCard();
    
    console.log("Card: ", card);
    
}

