jest.mock("./edge/trello");
jest.mock("./edge/tumblr");
jest.mock("./edge/share");
jest.mock("./edge/openGraph");

const trello = require("./edge/trello");
const tumblr = require("./edge/tumblr");
const share = require("./edge/share");
const metadata = require("./edge/openGraph");

const subject = require("./index");

describe("The emphasis mine function", () => {
    beforeEach(() => {
        trello.mockReturnValue(_mocked.trello);
        tumblr.post = jest.fn(() => Promise.resolve());
        share.post = jest.fn(() => Promise.resolve());
    });

    describe("given no cards in the list", () => {
        beforeEach(async () => {
            await run();
        });

        it("does not post anything", () => {
            expect(tumblr.post).not.toHaveBeenCalled();
        });

        it("creates a card to remind me to read something interesting", () => {
            expect(_mocked.trello.createCard)
                .toHaveBeenCalledWith(readReminder, null, null,
                    [_mocked.trello.labels.deep]);
        });
    });

    describe("given a card", () => {
        let card

        beforeEach(async () => {
            metadata.fetch = jest.fn(_ => {
                return Promise.resolve({
                    image: "https://beatles.pics/ringo",
                });
            });
            card = {
                name: "There is a barber showing photographs",
                desc: `“Of ev‘ry #head he’s had the pleasure to know” #come \n\n\\#go`,
                attachments: [{url: "http://penny.lane"}],
            };
            arrangeCard(card);
            await run();
        });

        it('fetches metadata for the link', () => {
            expect(metadata.fetch).toHaveBeenCalledWith("http://penny.lane");
        });

        it("posts to Tumblr", () => {
            expect(tumblr.post).toHaveBeenCalledWith({
                content: [
                    {
                        type: "link",
                        url: "http://penny.lane",
                        title: "There is a barber showing photographs",
                        poster: [{
                            url: "https://beatles.pics/ringo",
                        }],
                    },
                    {
                        type: "text",
                        text: "\"Of ev\'ry head he\'s had the pleasure to know\"",
                    }
                ],
                tags: ["head", "come", "go"],
            });
        });

        it('shares to socials', () => {
            expect(share.post).toHaveBeenCalledWith({
                link:"http://penny.lane" ,
                text: "\"Of ev\'ry head he\'s had the pleasure to know\"",
                tags: "head,come,go"
            })
        });

        describe('when debugging', () => {
            it('pass the debug flag to share', async () => {
                await runDebug();
                expect(share.post).toHaveBeenCalledWith({
                    debug: true,
                    link:"http://penny.lane" ,
                    text: "\"Of ev\'ry head he\'s had the pleasure to know\"",
                    tags: "head,come,go"
                })
            });
        });

        it('archives the Trello card', () => {
            expect(_mocked.trello.archive).toHaveBeenCalledWith(card);
        });

        describe('with no metadata', () => {
            beforeEach(async () => {
                metadata.fetch.mockReturnValue(Promise.resolve(null))
                tumblr.post.mockClear()
                _mocked.trello.archive.mockClear()
                arrangeCard(card);
                await run();
            });

            expectLinkPostWithoutPoster();
        });

        describe('with no metadata image', () => {
            beforeEach(async () => {
                metadata.fetch.mockReturnValue(Promise.resolve({}))
                tumblr.post.mockClear()
                _mocked.trello.archive.mockClear()
                arrangeCard(card);
                await run();
            });

            expectLinkPostWithoutPoster();
        });

        describe('with an incomplete metadata image', () => {
            beforeEach(async () => {
                metadata.fetch.mockReturnValue(Promise.resolve({image: "/rel/path/to/img"}))
                tumblr.post.mockClear()
                _mocked.trello.archive.mockClear()
                arrangeCard(card);
                await run();
            });

            expectLinkPostWithoutPoster();
        });

        describe("with no URL attachment", () => {
            beforeEach(async () => {
                metadata.fetch.mockReturnValue(Promise.resolve({image: "https://beatles.pics/ringo"}))
                tumblr.post.mockClear()
                _mocked.trello.archive.mockClear()
                card = {
                    name: "Let me take you down",
                    desc: `I'm going to Strawberry Fields. #nothingisreal #gethungabout http://penny.lane [http://penny.lane](http://penny.lane "") `,
                    attachments: [],
                };
                arrangeCard(card);
                await run();
            });


            it("it extracts the URL from the description", () => {
                expect(tumblr.post).toHaveBeenCalledWith({
                    content: [
                        {
                            type: "link",
                            url: "http://penny.lane",
                            title: "Let me take you down",
                            poster: [{
                                url: "https://beatles.pics/ringo",
                            }],
                        },
                        {
                            type: "text",
                            text: "I'm going to Strawberry Fields.",
                        }
                    ],
                    tags: ["nothingisreal", "gethungabout"],
                });
            });

            describe("and no URL in the description", () => {
                beforeEach(async () => {
                    tumblr.post.mockClear()
                    _mocked.trello.archive.mockClear()
                    card = {
                        name: "Let me take you down",
                        desc: "I'm going to Strawberry Fields. #nothingisreal #gethungabout ",
                        attachments: [],
                    };
                    arrangeCard(card);
                    await run();
                });

                it("does not create a post", () => {
                    expect(tumblr.post).not.toHaveBeenCalled()
                    expect(_mocked.trello.archive).not.toHaveBeenCalled();
                });
            });
        });

        describe("that is a reminder to read", () => {
            beforeEach(async () => {
                tumblr.post.mockClear()
                _mocked.trello.archive.mockClear()
                _mocked.trello.createCard.mockClear();
                arrangeCard({name: "Read: something interesting"});
                await run();
            });

            it("does not post anything", () => {
                expect(tumblr.post).not.toHaveBeenCalled();
            });

            it("does not add another read reminder card", () => {
                expect(_mocked.trello.createCard).not.toHaveBeenCalled();
            });
        });

        function expectLinkPostWithoutPoster() {
            it("creates a link post without a poster", () => {
                expect(metadata.fetch).toHaveBeenCalledWith("http://penny.lane");
                expect(tumblr.post).toHaveBeenCalledWith({
                    content: [
                        {
                            type: "link",
                            url: "http://penny.lane",
                            title: "There is a barber showing photographs",
                        },
                        {
                            type: "text",
                            text: "\"Of ev\'ry head he\'s had the pleasure to know\"",
                        }
                    ],
                    tags: ["head", "come", "go"],
                });
                expect(_mocked.trello.archive).toHaveBeenCalledWith(card);
            });
        }
    });
});

function arrangeCard(card) {
    _mocked.trello.getNextCard.mockReturnValue(Promise.resolve(card));
}

async function run() {
    process.env.debug = 'false';
    await subject(_mocked.context);
}

async function runDebug() {
    process.env.debug = 'true';
    await subject(_mocked.context);
}

const _mocked = {
    context: {
        log: jest.fn(),
    },
    trello: {
        getNextCard: jest.fn(() => Promise.resolve(null)),
        createCard: jest.fn(() => Promise.resolve(null)),
        archive: jest.fn(() => Promise.resolve(null)),
        itsAMock: true,
        labels: {
            deep: "912834759pqu3iorh",
            shallow: "awoiegfi34",
        },
    },
};

const readReminder = "Read: something interesting";
