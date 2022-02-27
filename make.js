const fn = require("./emphasismine/index");
const dotenv = require("dotenv");

dotenv.config();
main();

async function main() {
    await fn(console);
}

