jest.mock("./trello"); 
jest.mock("./tumblr");
jest.mock("./openGraph");

const trello = require("./trello");
const tumblr = require("./tumblr");
const metadata = require("./openGraph");

const subject = require("./index");

describe("The emphasis mine function", () => {
  beforeEach(() => {
    trello.mockReturnValue(_mocked.trello);
    tumblr.post = jest.fn(() => Promise.resolve());
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
          [
            _mocked.trello.labels.deliverValueContinuously, 
            _mocked.trello.labels.experimentAndLearnRapidly
          ]);
    });
  });

  describe("given a card", () => {
    beforeEach(() => {
      metadata.fetch = jest.fn(url => {
        return Promise.resolve({
          image: "https://beatles.pics/ringo",
        });
      });
    });

    it("creates a link post", async () => {
      const card = {
        name: "There is a barber showing photographs",
        desc: "Of every #head he's had the pleasure to know #come #go",
        attachments: [{ url: "http://penny.lane" }],
      };
      arrangeCard(card);
      await run();
      expect(metadata.fetch).toHaveBeenCalledWith("http://penny.lane");
      expect(tumblr.post).toHaveBeenCalledWith({
        title: "There is a barber showing photographs",
        description: "Of every head he's had the pleasure to know",
        url: "http://penny.lane",
        type: "link",
        tags: "head,come,go",
        thumbnail: "https://beatles.pics/ringo",
      });
      expect(_mocked.trello.archive).toHaveBeenCalledWith(card);
    });

    describe("with no URL attachment", () => {
      it("creates a text post", async () => {
        const card = {
          name: "Let me take you down",
          desc: "I'm going to Strawberry Fields. #nothingisreal #gethungabout  ",
          attachments: [],
        };
        arrangeCard(card);
        await run();
        expect(tumblr.post).toHaveBeenCalledWith({
          title: "Let me take you down",
          body: "I'm going to Strawberry Fields.",
          url: null,
          type: "text",
          tags: "nothingisreal,gethungabout",
        });
        expect(_mocked.trello.archive).toHaveBeenCalledWith(card);
      });
    });

    describe("that is a reminder to read", () => {
      beforeEach(async () => {
        _mocked.trello.createCard.mockClear();
        arrangeCard({ name: "Read: something interesting" });
        await run();
      });

      it("does not post anything", () => {
        expect(tumblr.post).not.toHaveBeenCalled();
      });

      it("does not add another read reminder card", () => {
        expect(_mocked.trello.createCard).not.toHaveBeenCalled();
      });
    });
  });
});

function arrangeCard(card) {
  _mocked.trello.getNextCard.mockReturnValue(Promise.resolve(card));
}

async function run() {
  await subject(_mocked.context, _mocked.timer);
}

const _mocked = {
  context: {
    log: jest.fn(),
  },
  timer: { isPastDue: false },
  trello: {
    getNextCard: jest.fn(() => Promise.resolve(null)),
    createCard: jest.fn(() => Promise.resolve(null)),
    archive: jest.fn(() => Promise.resolve(null)),
    itsAMock: true,
    labels: {
      deliverValueContinuously: "5cca03c6af45832d134e2bce",
      experimentAndLearnRapidly: "5cca03e5112dde45f0813208",
      makeSafetyAPrerequisite: "5cca03d8ffff90513f348518",
      makePeopleAwesome: "5cca03bbda292567444b6024",
    },
  },
};

const readReminder = "Read: something interesting";
