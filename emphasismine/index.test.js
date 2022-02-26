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
    it("creates a link post", async () => {
      arrangeCard({ name: "Bobby" });
      await run();
      expect(tumblr.post).toHaveBeenCalled();
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
  }
};
