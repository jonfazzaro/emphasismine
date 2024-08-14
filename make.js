const _ = require("dotenv").config();
const fn = require("./emphasismine/index");

main();

async function main() {
    await fn(console);
}

