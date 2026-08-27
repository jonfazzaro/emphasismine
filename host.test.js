const { readFileSync } = require("fs");

describe("The Function host configuration", () => {
    describe("when Azure Functions resolves binding extensions", () => {
        it("selects the active v4 extension bundle", () => {
            const hostConfiguration = JSON.parse(readFileSync("host.json", "utf8"));

            expect(hostConfiguration.extensionBundle.version).toBe("[4.0.0, 5.0.0)");
        });
    });
});
