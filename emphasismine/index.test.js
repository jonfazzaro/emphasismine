const trello = require("./trello");
const tumblr = require("./tumblr");
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

    // TODO: create a card: "Read something interesting"
  });

  describe("given a card", () => {
    describe("with no URL attachment", () => {
      it("creates a text post", async () => {
        arrangeCard({
          name: "Let me take you down",
          desc: "I'm going to Strawberry Fields. #nothingisreal #gethungabout  ",
          attachments: [],
        });
        await run();
        expect(tumblr.post).toHaveBeenCalledWith({
          title: "Let me take you down",
          description: "I'm going to Strawberry Fields.",
          url: null,
          type: "text",
          tags: "emphasismine,nothingisreal,gethungabout"
        });
      });
    });

    it("creates a link post", async () => {
      arrangeCard({
        name: "There is a barber showing photographs",
        desc: "Of every head he's had the pleasure to know #come #go",
        attachments: [{url: "http://penny.lane"}],
      });
      await run();
      expect(tumblr.post).toHaveBeenCalledWith({
        title: "There is a barber showing photographs",
        description: "Of every head he's had the pleasure to know",
        url: "http://penny.lane",
        type: "link",
        tags: "emphasismine,come,go"
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

jest.mock("./trello");
jest.mock("./tumblr");

const _mocked = {
  context: {
    log: jest.fn(),
  },
  timer: { isPastDue: false },
  trello: {
    getNextCard: jest.fn(() => Promise.resolve(null)),
  },
};
