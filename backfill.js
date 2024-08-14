const _ = require("dotenv").config();
const fn = require("./emphasismine/index");
const dotenv = require("dotenv");

main();

async function main() {
    const em = await fn({asLibrary: true, log: console.log});


}

