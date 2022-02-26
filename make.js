const trello = require("./emphasismine/trello")(console);
const dotenv = require("dotenv");

dotenv.config();
main();

async function main() {

    
    const cards = await trello.getCards();
    
    console.log("Cards: ", await cards.json());
    
}

