const fn = require("./emphasismine/index");
const dotenv = require("dotenv");

dotenv.config();
main();

async function main() {
    const em = await fn({asLibrary: true, log: console.log});


}

